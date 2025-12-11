import { makeTracer } from '@agoric/internal';
import { M } from '@endo/patterns';
import { prepareChainHubAdmin } from '../exos/chain-hub-admin.js';
import { registerChainsAndAssets } from '../utils/chain-hub-helper.js';
import { withOrchestration } from '../utils/start-helper.js';
import * as evmFlows from './axelar-gmp.flows.js';
import { prepareEvmAccountKit } from './axelar-gmp-account-kit.js';

/**
 * @import {Remote} from '@agoric/vow';
 * @import {Zone} from '@agoric/zone';
 * @import {OrchestrationPowers, OrchestrationTools} from '../utils/start-helper.js';
 * @import {CosmosChainInfo, Denom, DenomDetail} from '@agoric/orchestration';
 * @import {Marshaller, StorageNode} from '@agoric/internal/src/lib-chainStorage.js';
 * @import {ZCF} from '@agoric/zoe';
 */

const trace = makeTracer('createNfa');

/**
 * Orchestration contract to be wrapped by withOrchestration for Zoe
 *
 * @param {ZCF} zcf
 * @param {OrchestrationPowers & {
 *   marshaller: Remote<Marshaller>;
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
  { chainHub, orchestrateAll, zoeTools, vowTools },
) => {
  trace('starting createlcaAndGmp contract');

  trace('registering chain and assets', JSON.stringify(privateArgs));
  registerChainsAndAssets(
    chainHub,
    zcf.getTerms().brands,
    privateArgs.chainInfo,
    privateArgs.assetInfo,
  );

  const creatorFacet = prepareChainHubAdmin(zone, chainHub);

  const makeEvmAccountKit = prepareEvmAccountKit(zone.subZone('evmTap'), {
    zcf,
    vowTools,
    zoeTools,
  });

  const { localTransfer } = zoeTools;
  const { createlcaAndGmp } = orchestrateAll(evmFlows, {
    localTransfer,
    makeEvmAccountKit,
    chainHub,
  });

  const publicFacet = zone.exo(
    'Send PF',
    M.interface('Send PF', {
      createlcaAndGmp: M.callWhen().returns(M.any()),
    }),
    {
      createlcaAndGmp() {
        return zcf.makeInvitation(
          /**
           * @param {ZCFSeat} seat
           */
          seat => {
            return createlcaAndGmp(seat);
          },
          'createlcaAndGmp',
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
