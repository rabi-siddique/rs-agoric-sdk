import { makeTracer } from '@agoric/internal';
import { E } from '@endo/far';

const contractName = 'resolverMock';

const trace = makeTracer('vPProposal');
export const startContract = async ({
  produce,
  consume: { chainStorage, startUpgradable, board },
  installation: {
    consume: { [contractName]: installation, [`${contractName}Kit`]: kitP },
  },
  instance: {
    produce: { [contractName]: produceInstance },
  },
}) => {
  const boardAux = await E(chainStorage).makeChildNode('vStoragePusher');
  const storageNode = await E(boardAux).makeChildNode('portfolios');
  const marshaller = await E(board).getPublishingMarshaller();

  // if (true) {
  //   const kit = await kitP;
  //   await E(kit.adminFacet).terminateContract(
  //     Error('shutting down for replacement'),
  //   );
  // }

  const kit = await E(startUpgradable)({
    installation,
    issuerKeywordRecord: {},
    terms: {},
    privateArgs: { storageNode, marshaller },
    label: contractName,
  });

  produceInstance.reset();
  produceInstance.resolve(kit.instance);

  produce[`${contractName}Kit`].reset();
  produce[`${contractName}Kit`].resolve(kit);

  const [instanceId] = await [E(board).getId(kit.instance)];
  trace('instanceId:', instanceId);
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
        chainStorage: true,
        startUpgradable: true,
        [`${contractName}Kit`]: true,
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
