/**
 * @import {VowTools} from '@agoric/vow';
 * @import {Zone} from '@agoric/zone';
 * @import {TypedPattern} from '@agoric/internal';
 * @import {ZoeTools} from '@agoric/orchestration/src/utils/zoe-tools.js';
 * @import {AxelarGmpOutgoingMemo, ContractCall} from '@agoric/orchestration/src/axelar-types.js';
 * @import {ZCF, ZCFSeat} from '@agoric/zoe';
 * @import {CosmosChainAddress, OrchestrationAccount} from '@agoric/orchestration';
 * @import {AmountArg} from '@agoric/orchestration';
 */

/** @typedef {ContractCall} ContractCall */

export const EVM_CHAINS = {
  Avalanche: 'Avalanche',
  Base: 'base-sepolia',
  Ethereum: 'ethereum-sepolia',
};

/**
 * @typedef {keyof typeof EVM_CHAINS} SupportedChains
 */

/**
 * @typedef {object} OfferArgs
 * @property {string} destinationAddress
 * @property {SupportedChains}  destinationEVMChain
 */

/**
 * @typedef {object} KitState
 * @property {OrchestrationAccount<{ chainId: 'agoric' }>} localAccount
 * @property {any} remoteChainInfo
 */

import { M, mustMatch } from '@endo/patterns';
import { VowShape } from '@agoric/vow';
import { makeTracer } from '@agoric/internal';
import { Fail } from '@endo/errors';
import { gmpAddresses } from '@agoric/orchestration/src/utils/gmp.js';

const trace = makeTracer('EvmAccountKit');

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

/** @type {TypedPattern<KitState>} */
const EvmKitStateShape = {
  localAccount: M.remotable('LocalAccount'),
  remoteChainInfo: M.any(),
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
     * @param {KitState} initialState
     * @returns {KitState}
     */
    initialState => {
      mustMatch(initialState, EvmKitStateShape);
      return harden({
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
         * @param {OfferArgs} offerArgs
         */
        async sendGmp(seat, offerArgs) {
          trace('Inside sendGmp');
          const { destinationAddress, destinationEVMChain } = offerArgs;

          const { chainId } = this.state.remoteChainInfo;
          const gasAmount = 15_000_000;

          /** @type {AxelarGmpOutgoingMemo} */
          const memo = {
            destination_chain: destinationEVMChain,
            destination_address: destinationAddress,
            payload: null,
            type: 1,
            fee: {
              amount: String(gasAmount),
              recipient: gmpAddresses.AXELAR_GAS,
            },
          };

          trace('Initiating IBC Transfer...');
          await this.state.localAccount.transfer(
            {
              value: gmpAddresses.AXELAR_GMP,
              encoding: 'bech32',
              chainId,
            },
            {
              denom: 'ubld',
              value: BigInt(gasAmount),
            },
            { memo: JSON.stringify(memo) },
          );

          seat.exit();
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
