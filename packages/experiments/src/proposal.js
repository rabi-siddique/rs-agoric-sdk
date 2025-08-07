import { E } from '@endo/far';

const contractName = 'vStoragePusherV1';
export const startContract = async ({
  consume: { chainStorage, startUpgradable, board },
  installation: {
    consume: { [contractName]: installation },
  },
  instance: {
    produce: { [contractName]: produceInstance },
  },
}) => {
  const boardAux = await E(chainStorage).makeChildNode('vStoragePusher');
  const storageNode = await E(boardAux).makeChildNode('portfolios');
  const marshaller = await E(board).getPublishingMarshaller();

  const { instance } = await E(startUpgradable)({
    installation,
    issuerKeywordRecord: {},
    terms: {},
    privateArgs: { storageNode, marshaller },
    label: contractName,
  });

  produceInstance.resolve(instance);
};

export const getManifest = ({ restoreRef }, { installKeys }) => ({
  installations: {
    [contractName]: restoreRef(installKeys[contractName]),
  },
  manifest: {
    [startContract.name]: {
      consume: {
        board: true,
        chainStorage: true,
        startUpgradable: true,
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
