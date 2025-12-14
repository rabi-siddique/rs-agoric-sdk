import { makeTracer } from '@agoric/internal';
import { E } from '@endo/far';
import { contractName } from 'agoric-contract-experiments/src/name.js';

const trace = makeTracer('upgrade');

export const upgradeContract = async (
  { consume },
  { options: { contractRef } },
) => {
  trace(`upgrading ${contractName}`);

  assert(contractRef.bundleID, 'bundleID is required');
  trace('bundle ID:', contractRef.bundleID);

  const kit = await consume[`${contractName}Kit`];

  trace('performing upgrade...');
  const upgradeResult = await E(kit.adminFacet).upgradeContract(
    contractRef.bundleID,
  );
  trace('upgrade completed successfully:', upgradeResult);
};

export const getManifest = ({ restoreRef }, { contractRef }) => ({
  installations: {
    [contractName]: restoreRef(contractRef),
  },
  manifest: {
    [upgradeContract.name]: {
      consume: {
        [`${contractName}Kit`]: true,
      },
    },
  },
  options: {
    contractRef,
  },
});
