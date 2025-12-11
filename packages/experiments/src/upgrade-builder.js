import { makeHelpers } from '@agoric/deploy-script-support';
import { getManifest, upgradeContract } from './upgrade-contract.js';
import { contractName } from './name.js';
/**
 * @import {CoreEvalBuilder} from '@agoric/deploy-script-support/src/externalTypes.js'
 */

/** @type {CoreEvalBuilder} */
export const defaultProposalBuilder = async ({ publishRef, install }) => {
  return harden({
    sourceSpec: './upgrade-contract.js',
    getManifestCall: [
      getManifest.name,
      {
        installKeys: {
          [contractName]: publishRef(install('./contract.js')),
        },
      },
    ],
  });
};

export default async (homeP, endowments) => {
  const { writeCoreEval } = await makeHelpers(homeP, endowments);
  await writeCoreEval(upgradeContract.name, opts =>
    defaultProposalBuilder(opts),
  );
};
