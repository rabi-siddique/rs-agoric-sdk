import { makeTracer } from '@agoric/internal';
import { E } from '@endo/far';
import { contractName } from './name.js';

const trace = makeTracer('upgrade');

export const upgradeContract = async ({
  installation: {
    consume: { [contractName]: installation },
  },
  consume,
}) => {
  trace(`upgrading ${contractName}`);

  const kit = await consume[`${contractName}Kit`];

  trace('performing upgrade...');
  await E(kit.adminFacet).upgradeContract(installation);
  trace('upgrade completed successfully');
};

export const getManifest = ({ restoreRef }, { installKeys }) => ({
  installations: {
    [contractName]: restoreRef(installKeys[contractName]),
  },
  manifest: {
    [upgradeContract.name]: {
      consume: {
        [`${contractName}Kit`]: true,
      },
      installation: {
        consume: { [contractName]: true },
      },
    },
  },
});
