import { execFileSync } from 'node:child_process';
import { makeHelpers } from '@agoric/deploy-script-support';
import { parseArgs } from 'node:util';
import { contractName, getManifest, startContract } from './cctp-start.js';
import { getChainConfig } from './get-chain-config.js';

export const assetInfo = JSON.stringify([
  [
    'uist',
    {
      baseDenom: 'uist',
      baseName: 'agoric',
      chainName: 'agoric',
    },
  ],
  [
    'ubld',
    {
      baseDenom: 'ubld',
      baseName: 'agoric',
      chainName: 'agoric',
    },
  ],
  [
    // TODO
    `ibc/`,
    ,
    {
      baseName: 'noble',
      chainName: 'agoric',
      baseDenom: 'uusdc',
      brandKey: 'USDC',
    },
  ],
]);

/** @typedef {{ net?: string, peer?: string[] }} PeerChainOpts */

/**
 * @import {CoreEvalBuilder} from '@agoric/deploy-script-support/src/externalTypes.js';
 */

/** @type {CoreEvalBuilder} */
export const defaultProposalBuilder = async (
  { publishRef, install },
  options,
) =>
  harden({
    sourceSpec: './cctp-start.js',
    getManifestCall: [
      getManifest.name,
      {
        [contractName]: publishRef(install('./cctp.contract.js')),
        options,
      },
    ],
  });

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').DeployScriptFunction} */
export default async (homeP, endowments) => {
  const { scriptArgs } = endowments;

  /** @type {import('node:util').ParseArgsConfig['options']} */
  const options = {
    net: {
      type: 'string',
    },
    peer: { type: 'string', multiple: true },
  };

  /** @type {{ values: PeerChainOpts }} */
  const { values: flags } = parseArgs({ args: scriptArgs, options });

  const parseAssetInfo = () => {
    if (typeof assetInfo !== 'string') return undefined;
    return JSON.parse(assetInfo);
  };

  if (!flags.net) throw Error('--net required');
  if (!flags.peer) throw Error('--peer required');

  const chainDetails = await getChainConfig({
    net: flags.net,
    peers: flags.peer,
    execFileSync,
  });

  const opts = harden({
    chainInfo: chainDetails,
    assetInfo: parseAssetInfo(),
  });

  const { writeCoreEval } = await makeHelpers(homeP, endowments);

  await writeCoreEval(startContract.name, utils =>
    defaultProposalBuilder(utils, opts),
  );
};
