import { makeTracer } from '@agoric/internal';
import { E } from '@endo/far';
import { contractName } from './name.js';

const trace = makeTracer('proposal');
export const startContract = async ({
  produce,
  consume: { chainStorage, startUpgradable, board },
  installation: {
    consume: { [contractName]: installation },
  },
  instance: {
    produce: { [contractName]: produceInstance },
  },
}) => {
  trace(`start ${contractName}`);

  const boardAux = await E(chainStorage).makeChildNode('vStoragePusher');
  const storageNode = await E(boardAux).makeChildNode('portfolios');
  const marshaller = await E(board).getPublishingMarshaller();

  trace('starting contract...');
  const kit = await E(startUpgradable)({
    installation,
    issuerKeywordRecord: {},
    terms: {},
    privateArgs: { storageNode, marshaller },
    label: contractName,
  });
  trace('contract started successfully');

  produceInstance.reset();
  produceInstance.resolve(kit.instance);

  produce[`${contractName}Kit`].reset();
  produce[`${contractName}Kit`].resolve(kit);
  trace('kit resolved');
};

export const getManifest = ({ restoreRef }, { installKeys }) => ({
  installations: {
    [contractName]: restoreRef(installKeys[contractName]),
  },
  manifest: {
    [startContract.name]: {
      produce: {
        [`${contractName}Kit`]: true,
      },
      consume: {
        board: true,
        startUpgradable: true,
        chainStorage: true,
      },
      installation: {
        consume: { [contractName]: true },
      },
      instance: {
        consume: { [contractName]: true },
        produce: { [contractName]: true },
      },
    },
  },
});
