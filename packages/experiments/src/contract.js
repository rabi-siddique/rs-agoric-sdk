import { makeTracer } from '@agoric/internal';
import { M } from '@endo/patterns';
import {
  withOrchestration,
  registerChainsAndAssets,
  prepareChainHubAdmin,
} from '@agoric/orchestration';
import { prepareEvmAccountKit } from './account-kit.js';
import * as evmFlows from './contract.flows.js';
import { Fail } from '@endo/errors';
import { contractName } from './name.js';

/**
 * @import {Remote} from '@agoric/vow';
 * @import {Zone} from '@agoric/zone';
 * @import {OrchestrationPowers, OrchestrationTools} from '@agoric/orchestration';
 * @import {CosmosChainInfo, Denom, DenomDetail} from '@agoric/orchestration';
 * @import {Marshaller, StorageNode} from '@agoric/internal/src/lib-chainStorage.js';
 * @import {ZCF} from '@agoric/zoe';
 */

const trace = makeTracer(contractName);

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
  { chainHub, orchestrateAll, vowTools, zoeTools },
) => {
  trace(`${contractName} started`);

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

  // const { localTransfer, withdrawToSeat } = zoeTools;
  const { createLCA } = orchestrateAll(evmFlows, {
    makeEvmAccountKit,
  });

  const publicFacet = zone.exo(
    `${contractName} PF`,
    M.interface(`${contractName} PF`, {
      createLCA: M.callWhen().returns(M.any()),
    }),
    {
      createLCA() {
        return zcf.makeInvitation(
          /**
           * @param {ZCFSeat} seat
           * @param {import('./account-kit.js').OfferArgs} offerArgs
           */
          (seat, offerArgs) => {
            const { destinationAddress, destinationEVMChain } = offerArgs;

            destinationAddress != null ||
              Fail`Destination address must be defined`;
            destinationEVMChain != null ||
              Fail`Destination evm address must be defined`;
            return createLCA(seat, offerArgs);
          },
          'makeAccount',
          undefined,
        );
      },
    },
  );

  return { publicFacet, creatorFacet };
};
harden(contract);

export const start = withOrchestration(contract);
harden(start);
