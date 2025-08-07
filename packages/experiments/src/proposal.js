import { makeTracer } from '@agoric/internal';
import { E } from '@endo/far';

const contractName = 'resolverMock';

const trace = makeTracer('vPProposal');
export const startContract = async ({
  produce,
  consume: { chainStorage, startUpgradable, board, ...consume },
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

  const oldkit = await consume[`${contractName}Kit`];
  await E(oldkit.adminFacet).terminateContract(
    Error('shutting down for replacement'),
  );

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
