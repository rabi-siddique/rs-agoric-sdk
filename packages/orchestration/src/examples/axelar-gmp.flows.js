/**
 * @file Implements the orchestration flow which does the following:
 *
 *   - Creates an EVM account on the target chain.
 *   - Sets up and monitors the Local Chain Account (LCA).
 *   - Coordinates IBC-related logic through `createAndMonitorLCA()`.
 *
 *   For more details, see: docs/axelar-gmp/create-and-use-wallet.mmd in
 *   orchestration package.
 */

import { makeTracer } from '@agoric/internal';

/**
 * @import {GuestInterface, GuestOf} from '@agoric/async-flow';
 * @import {Orchestrator, OrchestrationFlow} from '@agoric/orchestration';
 * @import {MakeEvmAccountKit} from './axelar-gmp-account-kit.js';
 * @import {ChainHub} from '@agoric/orchestration/src/exos/chain-hub.js';
 * @import {Vow} from '@agoric/vow';
 * @import {ZCFSeat, AmountKeywordRecord} from '@agoric/zoe';
 * @import {LocalAccountMethods} from '@agoric/orchestration';
 */

const trace = makeTracer('EvmFlow');

/**
 * @satisfies {OrchestrationFlow}
 * @param {Orchestrator} orch
 * @param {{
 *   makeEvmAccountKit: MakeEvmAccountKit;
 *   chainHub: GuestInterface<ChainHub>;
 *   log: GuestOf<(msg: string) => Vow<void>>;
 *   localTransfer: GuestOf<
 *     (
 *       srcSeat: ZCFSeat,
 *       localAccount: LocalAccountMethods,
 *       amounts: AmountKeywordRecord,
 *     ) => Vow<void>
 *   >;
 *   withdrawToSeat: GuestOf<
 *     (
 *       localAccount: LocalAccountMethods,
 *       destSeat: ZCFSeat,
 *       amounts: AmountKeywordRecord,
 *     ) => Vow<void>
 *   >;
 * }} ctx
 * @param {ZCFSeat} seat
 */
export const createlca = async (
  orch,
  { makeEvmAccountKit, chainHub },
  seat,
) => {
  trace('inside createlca');

  const [agoric, remoteChain] = await Promise.all([
    orch.getChain('agoric'),
    orch.getChain('axelar'),
  ]);
  const { chainId } = await remoteChain.getChainInfo();

  // create lca
  const lca = await agoric.makeAccount();
  const lcaAddr = await lca.getAddress();
  trace(`lca addr: ${lcaAddr.value}`);
  trace(`done`);

  const agoricChainId = (await agoric.getChainInfo()).chainId;
  const { transferChannel } = await chainHub.getConnectionInfo(
    agoricChainId,
    chainId,
  );

  const evmAccountKit = makeEvmAccountKit({
    localAccount: lca,
    localChainAddress: lcaAddr,
    sourceChannel: transferChannel.counterPartyChannelId,
  });

  // @ts-expect-error
  await lca.monitorTransfers(evmAccountKit.tap);
  trace('Monitoring transfers setup successfully');

  seat.exit();
  return harden({ invitationMakers: accountKit.invitationMakers });
};
harden(createlca);
