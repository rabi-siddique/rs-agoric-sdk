import { E } from '@endo/far';

const contractName = 'counter';
export const startContract = async ({
  consume: { chainStorage, startUpgradable, chainTimerService },
  installation: {
    consume: { [contractName]: installation },
  },
  instance: {
    produce: { [contractName]: produceInstance },
  },
}) => {
  const boardAux = await E(chainStorage).makeChildNode('counterData');
  const storageNode = await E(boardAux).makeChildNode('counter');
  await E(storageNode).setValue(String(0));

  const { instance } = await E(startUpgradable)({
    installation,
    issuerKeywordRecord: {},
    terms: {},
    privateArgs: { storageNode, timerService: chainTimerService },
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
        chainStorage: true,
        contractKits: true,
        startUpgradable: true,
        chainTimerService: true,
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
