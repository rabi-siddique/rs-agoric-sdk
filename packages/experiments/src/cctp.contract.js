import { makeTracer } from '@agoric/internal';
import { M } from '@endo/patterns';
import {
  prepareChainHubAdmin,
  registerChainsAndAssets,
  withOrchestration,
} from '@agoric/orchestration';
import * as cctpFlows from './cctp.flows.js';

/**
 * @import {Remote} from '@agoric/vow';
 * @import {Zone} from '@agoric/zone';
 * @import {OrchestrationPowers, OrchestrationTools} from '@agoric/orchestration';
 * @import {Bech32Address, CaipChainId, CosmosChainInfo, Denom, DenomDetail} from '@agoric/orchestration';
 * @import {Marshaller, StorageNode} from '@agoric/internal/src/lib-chainStorage.js';
 * @import {ZCF} from '@agoric/zoe';
 */

const trace = makeTracer('cctp-contract');

/**
 * Orchestration contract to be wrapped by withOrchestration for Zoe
 *
 * @param {ZCF} zcf
 * @param {OrchestrationPowers & {
 *   marshaller: Marshaller;
 *   chainInfo?: Record<string, CosmosChainInfo>;
 *   assetInfo?: [Denom, DenomDetail & { brandKey?: string }][];
 *   storageNode: Remote<StorageNode>;
 * }} privateArgs
 * @param {Zone} zone
 * @param {OrchestrationTools} tools
 */
export const contract = async (
  zcf,
  privateArgs,
  zone,
  { chainHub, orchestrateAll, zoeTools },
) => {
  trace('starting cctp contract');

  trace('registering chain and assets');
  registerChainsAndAssets(
    chainHub,
    zcf.getTerms().brands,
    privateArgs.chainInfo,
    privateArgs.assetInfo,
  );

  const creatorFacet = prepareChainHubAdmin(zone, chainHub);

  const { localTransfer } = zoeTools;
  const { performCCTP } = orchestrateAll(cctpFlows, {
    localTransfer,
  });

  const publicFacet = zone.exo(
    'Send PF',
    M.interface('Send PF', {
      performCCTP: M.callWhen().returns(M.any()),
    }),
    {
      performCCTP() {
        return zcf.makeInvitation(
          /**
           * @param {ZCFSeat} seat
           * @param {{
           *   chainId: CaipChainId;
           *   remoteAddress: Bech32Address;
           * }} offerArgs
           */
          (seat, offerArgs) => {
            return performCCTP(seat, offerArgs);
          },
          'doCCTP',
          undefined,
        );
      },
    },
  );

  trace('contract started successfully');
  return { publicFacet, creatorFacet };
};
harden(contract);

export const start = withOrchestration(contract);
harden(start);
