import {
  deeplyFulfilledObject,
  makeTracer,
  NonNullish,
} from '@agoric/internal';
import { E } from '@endo/far';
import { contractName } from 'agoric-contract-experiments/src/name.js';

const trace = makeTracer('upgrade');

export const upgradeContract = async (
  {
    consume: {
      agoricNames,
      board,
      chainStorage,
      chainTimerService,
      cosmosInterchainService,
      localchain,
      [`${contractName}Kit`]: kitP,
    },
  },
  { options: { installationRef, chainInfo, assetInfo } },
) => {
  trace(`upgrading ${contractName}`);

  assert(installationRef.bundleID, 'bundleID is required');
  trace('bundle ID:', installationRef.bundleID);

  const kit = await kitP;
  trace('kit:', kit);
  assert(kit, `${contractName}Kit not found in bootstrap space`);
  trace('kit.adminFacet:', kit.adminFacet);
  assert(kit.adminFacet, `${contractName}Kit.adminFacet is undefined`);

  const marshaller = await E(board).getReadonlyMarshaller();

  trace('preparing privateArgs for upgrade');
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

  trace('performing upgrade...');
  const upgradeResult = await E(kit.adminFacet).upgradeContract(
    installationRef.bundleID,
    privateArgs,
  );
  trace('upgrade completed successfully:', upgradeResult);
};

export const getManifest = ({ restoreRef }, { installationRef, options }) => ({
  installations: {
    [contractName]: restoreRef(installationRef),
  },
  manifest: {
    [upgradeContract.name]: {
      consume: {
        [`${contractName}Kit`]: true,
        agoricNames: true,
        board: true,
        chainStorage: true,
        chainTimerService: true,
        cosmosInterchainService: true,
        localchain: true,
      },
    },
  },
  options: {
    ...options,
    installationRef,
  },
});
