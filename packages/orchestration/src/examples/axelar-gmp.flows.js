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
export const createNfa = async (orch, { localTransfer }, seat) => {
  trace('inside createNfa');
  const [agoric, noble] = await Promise.all([
    orch.getChain('agoric'),
    orch.getChain('noble'),
  ]);

  // create lca
  const lca = await agoric.makeAccount();
  const lcaAddr = await lca.getAddress();
  trace(`lca addr: ${lcaAddr}`);

  // create ica
  const ica = await noble.makeAccount();
  const icaAddr = await ica.getAddress();
  trace(`ica addr: ${icaAddr}`);

  // transfer fund to lca
  const { give } = seat.getProposal();
  await localTransfer(seat, lca, give);
  trace(`localTransfer success`);

  // register NFA
  const { chainId: nobleId } = await noble.getChainInfo();
  trace(`noble chainId ${nobleId}`);

  const memo = {
    noble: {
      forwarding: {
        recipient: lcaAddr.value,
      },
    },
  };

  const [[_kw, amt]] = Object.entries(give);
  trace(`calling transfer with amt: ${amt}`);
  await lca.transfer(
    {
      value: 'noble1n4j0cy98dac5q6d9y5nhlmk5d6e4wzve0gznrw',
      encoding: 'bech32',
      chainId: nobleId,
    },
    {
      denom: 'ubld',
      value: amt.value,
    },
    { memo: JSON.stringify(memo) },
  );
  trace(`done`);
};
harden(createNfa);
