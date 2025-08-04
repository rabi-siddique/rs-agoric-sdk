/// <reference types="@agoric/vats/src/core/types-ambient.js"/>

import {
  deeplyFulfilledObject,
  makeTracer,
  NonNullish,
} from '@agoric/internal';
import { E } from '@endo/far';

/**
 * @import {Issuer} from '@agoric/ertp';
 * @import {Installation, Instance} from '@agoric/zoe/src/zoeService/utils.js';
 * @import {CosmosChainInfo, Denom, DenomDetail} from '@agoric/orchestration';
 * @import {start as StartFn} from '@agoric/orchestration/src/examples/axelar-gmp.contract.js';
 */

const contractName = 'axelarGmpV1';
const trace = makeTracer(`start ${contractName}`, true);

/**
 * @param {BootstrapPowers & {
 *   installation: {
 *     consume: {
 *       axelarGmpV1: Installation<StartFn>;
 *     };
 *   };
 *   instance: {
 *     produce: {
 *       axelarGmpV1: Producer<Instance<StartFn>>;
 *     };
 *   };
 *   issuer: {
 *     consume: {
 *       BLD: Issuer<'nat'>;
 *     };
 *   };
 * }} powers
 * @param {{
 *   options: {
 *     chainInfo: Record<string, CosmosChainInfo>;
 *     assetInfo: [Denom, DenomDetail & { brandKey?: string }][];
 *   };
 * }} config
 */
export const startAxelarGmp = async (
  {
    consume: {
      agoricNames,
      board,
      chainStorage,
      chainTimerService,
      cosmosInterchainService,
      localchain,
      startUpgradable,
    },
    installation: {
      consume: { axelarGmpV1 },
    },
    instance: {
      produce: { [contractName]: produceInstance },
    },
    issuer: {
      consume: { BLD },
    },
  },
  { options: { chainInfo, assetInfo } },
) => {
  trace(startAxelarGmp.name);

  const marshaller = await E(board).getReadonlyMarshaller();

  trace('Setting privateArgs');

  const privateArgs = await deeplyFulfilledObject(
    harden({
      agoricNames,
      localchain,
      marshaller,
      orchestrationService: cosmosInterchainService,
      storageNode: E(NonNullish(await chainStorage)).makeChildNode(
        contractName,
      ),
      timerService: chainTimerService,
      chainInfo,
      assetInfo,
    }),
  );

  const issuerKeywordRecord = harden({
    BLD: await BLD,
  });
  trace('issuerKeywordRecord', issuerKeywordRecord);

  trace('Starting contract instance');
  const { instance } = await E(startUpgradable)({
    label: contractName,
    installation: axelarGmpV1,
    issuerKeywordRecord,
    privateArgs,
  });
  produceInstance.resolve(instance);
  trace('done');
};
harden(startAxelarGmp);

export const getManifest = ({ restoreRef }, { installationRef, options }) => {
  return {
    manifest: {
      [startAxelarGmp.name]: {
        consume: {
          agoricNames: true,
          board: true,
          chainTimerService: true,
          chainStorage: true,
          cosmosInterchainService: true,
          localchain: true,
          startUpgradable: true,
        },
        installation: {
          consume: { [contractName]: true },
        },
        instance: {
          produce: { [contractName]: true },
        },
        issuer: {
          consume: { BLD: true },
        },
      },
    },
    installations: {
      [contractName]: restoreRef(installationRef),
    },
    options,
  };
};
