import { execFileSync } from 'node:child_process';
import { makeHelpers } from '@agoric/deploy-script-support';
import { parseArgs } from 'node:util';
import { getManifest, startContract } from './start-contract.js';
import { assetInfo } from '@agoric/orchestration/src/utils/axelar-static-config.js';
import { getChainConfig } from '../../builders/scripts/orchestration/get-chain-config.js';

/** @typedef {{ net?: string, peer?: string[] }} PeerChainOpts */

/**
 * @import {CoreEvalBuilder} from '@agoric/deploy-script-support/src/externalTypes.js';
 * @import {DeployScriptFunction} from '@agoric/deploy-script-support/src/externalTypes.js';
 * @import {ParseArgsConfig} from 'node:util';
 */

/** @type {CoreEvalBuilder} */
export const defaultProposalBuilder = async (
  { publishRef, install },
  options,
) =>
  harden({
    sourceSpec: './start-contract.js',
    getManifestCall: [
      getManifest.name,
      {
        installationRef: publishRef(install('../dist/contract.bundle.js')),
        options,
      },
    ],
  });

/** @type {DeployScriptFunction} */
export default async (homeP, endowments) => {
  const { scriptArgs } = endowments;

  /** @type {ParseArgsConfig['options']} */
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

  const validNets = ['bootstrap', 'devnet', 'emerynet', 'local'];
  if (!validNets.includes(flags.net)) {
    throw Error(`--net must be one of: ${validNets.join(', ')}`);
  }

  const chainDetails = await getChainConfig({
    net: /** @type {'bootstrap' | 'devnet' | 'emerynet' | 'local'} */ (
      flags.net
    ),
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
