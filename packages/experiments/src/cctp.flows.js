import { makeTracer } from '@agoric/internal';

/**
 * @import {GuestOf} from '@agoric/async-flow';
 * @import {Orchestrator, OrchestrationFlow, CaipChainId, Bech32Address} from '@agoric/orchestration';
 * @import {Vow} from '@agoric/vow';
 * @import {ZCFSeat, AmountKeywordRecord} from '@agoric/zoe';
 * @import {LocalAccountMethods} from '@agoric/orchestration';
 */

const trace = makeTracer('cctp');

/**
 * @satisfies {OrchestrationFlow}
 * @param {Orchestrator} orch
 * @param {{
 *   localTransfer: GuestOf<
 *     (
 *       srcSeat: ZCFSeat,
 *       localAccount: LocalAccountMethods,
 *       amounts: AmountKeywordRecord,
 *     ) => Vow<void>
 *   >;
 * }} ctx
 * @param {ZCFSeat} seat
 * @param {{
 *   chainId: CaipChainId;
 *   remoteAddress: Bech32Address;
 * }} offerArgs
 */
export const performCCTP = async (orch, { localTransfer }, seat, offerArgs) => {
  const [agoric, noble] = await Promise.all([
    orch.getChain('agoric'),
    orch.getChain('noble'),
  ]);

  const { give } = seat.getProposal();
  const [[_kw, amt]] = Object.entries(give);

  const ica = await noble.makeAccount();
  const icaAddr = ica.getAddress();
  trace('noble addr', icaAddr);

  const lca = await agoric.makeAccount();
  const lcaAddr = lca.getAddress();
  trace('lca addr', lcaAddr);

  trace('transfer from seat to lca');
  await localTransfer(seat, lca, give);

  trace('IBC transfer', give, 'to', icaAddr, `${ica}`);
  await lca.transfer(icaAddr, amt);

  const denomAmount = { denom: 'uusdc', value: amt.value };
  const { chainId, remoteAddress } = offerArgs;
  const destinationAddress = `${chainId}:${remoteAddress}`;
  trace(`CCTP destinationAddress: ${destinationAddress}`);

  // @ts-expect-error
  await ica.depositForBurn(destinationAddress, denomAmount);
  trace('cctp complete');
};
harden(performCCTP);
