import { makeTracer } from '@agoric/internal';
import { Fail } from '@endo/errors';

/**
 * @import {GuestInterface} from '@agoric/async-flow';
 * @import {Orchestrator, OrchestrationFlow} from '@agoric/orchestration';
 * @import {MakeEvmAccountKit} from './account-kit.js';
 * @import {ChainHub} from '@agoric/orchestration/src/exos/chain-hub.js';
 * @import {ZCFSeat} from '@agoric/zoe';
 */

const trace = makeTracer('createLCA');

/**
 * @satisfies {OrchestrationFlow}
 * @param {Orchestrator} orch
 * @param {{
 *   makeEvmAccountKit: MakeEvmAccountKit;
 *   chainHub: GuestInterface<ChainHub>;
 * }} ctx
 * @param {ZCFSeat} seat
 * @param {{
 *   destinationAddress: string;
 *   destinationEVMChain: import('@agoric/orchestration/src/axelar-types').SupportedEVMChains;
 * }} offerArgs
 */
export const createLCA = async (
  orch,
  { makeEvmAccountKit },
  seat,
  offerArgs,
) => {
  trace('Inside createLCA');
  const [agoric, remoteChain] = await Promise.all([
    orch.getChain('agoric'),
    orch.getChain('axelar'),
  ]);
  const { chainId, stakingTokens } = await remoteChain.getChainInfo();
  const remoteDenom = stakingTokens[0].denom;
  remoteDenom || Fail`${chainId} does not have stakingTokens in config`;

  const localAccount = await agoric.makeAccount();
  trace('localAccount created successfully');
  const localChainAddress = await localAccount.getAddress();
  trace('Local Chain Address:', localChainAddress.value);

  const info = await remoteChain.getChainInfo();
  const evmAccountKit = makeEvmAccountKit({
    localAccount,
    remoteChainInfo: info,
  });

  // Fund the LCA first
  const { give } = seat.getProposal();
  await evmAccountKit.holder.fundLCA(seat, give);

  // Then perform the transfer
  await evmAccountKit.holder.sendGmp(seat, offerArgs);

  if (!seat.hasExited()) {
    seat.exit();
  }
  return harden({ invitationMakers: evmAccountKit.invitationMakers });
};
harden(createLCA);
