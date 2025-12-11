/**
 * @import {VTransferIBCEvent} from '@agoric/vats';
 * @import {Vow, VowTools} from '@agoric/vow';
 * @import {Zone} from '@agoric/zone';
 * @import {TypedPattern} from '@agoric/internal';
 * @import {FungibleTokenPacketData} from '@agoric/cosmic-proto/ibc/applications/transfer/v2/packet.js';
 * @import {ZoeTools} from '../utils/zoe-tools.js';
 * @import {AxelarGmpIncomingMemo, EvmTapState, ContractCall, SupportedEVMChains} from '../axelar-types.js';
 * @import {ZCF, ZCFSeat} from '@agoric/zoe';
 * @import {AxelarGmpOutgoingMemo, GMPMessageType} from '../axelar-types.js'
 * @import {CosmosChainAddress} from '@agoric/orchestration';
 * @import {AmountArg} from '@agoric/orchestration';
 */

/** @typedef {ContractCall} ContractCall */

import { M, mustMatch } from '@endo/patterns';
import { VowShape } from '@agoric/vow';
import { makeTracer } from '@agoric/internal';
import { Fail } from '@endo/errors';
import { CosmosChainAddressShape } from '../typeGuards.js';
import { gmpAddresses, buildGMPPayload } from '../utils/gmp.js';

const trace = makeTracer('EvmAccountKit');
const { entries } = Object;

const EVMI = M.interface('holder', {
  getLocalAddress: M.call().returns(M.any()),
  send: M.call(M.any(), M.any()).returns(M.any()),
  sendGmp: M.call(M.any(), M.any()).returns(M.any()),
  fundLCA: M.call(M.any(), M.any()).returns(VowShape),
});
harden(EVMI);

const InvitationMakerI = M.interface('invitationMaker', {
  makeEVMTransactionInvitation: M.call(M.string(), M.array()).returns(M.any()),
});
harden(InvitationMakerI);

/** @type {TypedPattern<EvmTapState>} */
const EvmKitStateShape = {
  localChainAddress: CosmosChainAddressShape,
  sourceChannel: M.string(),
  localAccount: M.remotable('LocalAccount'),
};
harden(EvmKitStateShape);

/**
 * @param {Zone} zone
 * @param {{
 *   zcf: ZCF;
 *   vowTools: VowTools;
 *   zoeTools: ZoeTools;
 * }} powers
 */
export const prepareEvmAccountKit = (zone, { zcf, vowTools, zoeTools }) => {
  return zone.exoClassKit(
    'EvmTapKit',
    {
      holder: EVMI,
      invitationMakers: InvitationMakerI,
    },
    /**
     * @param {EvmTapState} initialState
     * @returns {{
     *   evmAccountAddress: string | undefined;
     *   latestMessage:
     *     | { success: boolean; result: `0x${string}` }[]
     *     | undefined;
     * } & EvmTapState}
     */
    initialState => {
      mustMatch(initialState, EvmKitStateShape);
      return harden({
        evmAccountAddress: /** @type {string | undefined} */ (undefined),
        /**
         * @type {{ success: boolean; result: `0x${string}` }[]
         *   | undefined}
         */
        latestMessage: undefined,
        ...initialState,
      });
    },
    {
      holder: {
        getLocalAddress() {
          return this.state.localAccount.getAddress().value;
        },
        /**
         * Sends tokens from the local account to a specified Cosmos chain
         * address.
         *
         * @param {CosmosChainAddress} toAccount
         * @param {AmountArg} amount
         * @returns {Promise<string>} A success message upon completion.
         */
        async send(toAccount, amount) {
          await this.state.localAccount.send(toAccount, amount);
          return 'transfer success';
        },

        /**
         * @param {ZCFSeat} seat
         * @param {{
         *   destinationAddress: string;
         *   type: GMPMessageType;
         *   destinationEVMChain: SupportedEVMChains;
         *   gasAmount: number;
         *   contractInvocationData: ContractCall[];
         * }} offerArgs
         */
        async sendGmp(seat, offerArgs) {
          trace('Inside sendGmp');
          const {
            destinationAddress,
            type,
            destinationEVMChain,
            gasAmount,
            contractInvocationData,
          } = offerArgs;

          trace('Offer Args:', JSON.stringify(offerArgs));

          destinationAddress != null ||
            Fail`Destination address must be defined`;
          destinationEVMChain != null ||
            Fail`Destination evm address must be defined`;

          const isContractInvocation = [1, 2].includes(type);
          if (isContractInvocation) {
            gasAmount != null ||
              Fail`gasAmount must be defined for type ${type}`;
          }

          trace(`targets: [${destinationAddress}]`);
          trace(
            `contractInvocationData: ${JSON.stringify(contractInvocationData)}`,
          );

          const payload = buildGMPPayload(contractInvocationData);

          trace(`Payload: ${JSON.stringify(payload)}`);

          /** @type {AxelarGmpOutgoingMemo} */
          const memo = {
            destination_chain: destinationEVMChain,
            destination_address: destinationAddress,
            payload,
            type,
          };

          if (type === 1 || type === 2) {
            memo.fee = {
              amount: String(gasAmount),
              recipient: gmpAddresses.AXELAR_GAS,
            };
            trace(`Fee object ${JSON.stringify(memo.fee)}`);
          }

          trace('Initiating IBC Transfer...');
          await this.state.localAccount.transfer(
            {
              value: gmpAddresses.AXELAR_GMP,
              encoding: 'bech32',
              chainId: 'axelar-testnet-lisbon-3',
            },
            {
              denom: 'ubld',
              value: BigInt(gasAmount),
            },
            { memo: JSON.stringify(memo) },
          );

          seat.exit();
          trace('sendGmp successful');
          return 'sendGmp successful';
        },
        /**
         * @param {ZCFSeat} seat
         * @param {any} give
         */
        fundLCA(seat, give) {
          seat.hasExited() && Fail`The seat cannot be exited.`;
          return zoeTools.localTransfer(seat, this.state.localAccount, give);
        },
      },
      invitationMakers: {
        // "method" and "args" can be used to invoke methods of localAccount obj
        makeEVMTransactionInvitation(method, args) {
          const continuingEVMTransactionHandler = async seat => {
            await null;
            const { holder } = this.facets;
            switch (method) {
              case 'sendGmp': {
                const { give } = seat.getProposal();
                await vowTools.when(holder.fundLCA(seat, give));
                return holder.sendGmp(seat, args[0]);
              }
              case 'getLocalAddress': {
                const vow = holder.getLocalAddress();
                return vowTools.when(vow, res => {
                  seat.exit();
                  return res;
                });
              }
              case 'send': {
                const vow = holder.send(args[0], args[1]);
                return vowTools.when(vow, res => {
                  seat.exit();
                  return res;
                });
              }
              case 'fundLCA': {
                const { give } = seat.getProposal();
                const vow = holder.fundLCA(seat, give);
                return vowTools.when(vow, res => {
                  seat.exit();
                  return res;
                });
              }
              default:
                return 'Invalid method';
            }
          };

          return zcf.makeInvitation(
            continuingEVMTransactionHandler,
            'evmTransaction',
          );
        },
      },
    },
  );
};

/** @typedef {ReturnType<typeof prepareEvmAccountKit>} MakeEvmAccountKit */
/** @typedef {ReturnType<MakeEvmAccountKit>} EvmAccountKit */
