import { prepareExoClass, provide } from '@agoric/vat-data';
import { E } from '@endo/far';
import { M } from '@agoric/store';
import { makeTracer } from '@agoric/internal';
import { contractName } from './name.js';

const trace = makeTracer(contractName);

export const meta = { upgradability: 'canUpgrade' };

/**
 * @typedef {{
 *   vPath: string,
 *   vData: any,
 * }} PushOfferArgs
 */

/**
 * A simple contract that writes to vstorage
 *
 * @param {ZCF} zcf
 * @param {{
*   storageNode: StorageNode,
*   marshaller: Marshaller
* }} privateArgs

 * @param {MapStore<any, any>} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
  trace('NOTE: proposal updates remain based on this contract');
  const { storageNode, marshaller } = privateArgs;
  const isReincarnation = baggage.has(`${contractName} Public Facet_singleton`);

  if (isReincarnation) {
    trace(`${contractName} contract REINCARNATED (upgrade)`);
  } else {
    trace(`${contractName} contract FRESH START (first deployment)`);
  }

  const makePublicFacet = prepareExoClass(
    baggage,
    `${contractName} Public Facet`,
    M.interface(`${contractName} PF`, {
      vPusherInvitation: M.call().returns(M.any()),
    }),
    () => {
      trace('Init function called - creating new state');
      return {};
    },
    {
      vPusherInvitation() {
        return zcf.makeInvitation(
          async (seat, /** @type {PushOfferArgs} */ offerArgs) => {
            const { vPath, vData } = offerArgs;

            trace(`Pushing to ${vPath}:`, vData);

            const marshalled = await E(marshaller).toCapData(vData);
            const serialized = JSON.stringify(marshalled);
            const pathNode = E(storageNode).makeChildNode(vPath);
            await E(pathNode).setValue(serialized);

            seat.exit();
          },
          'push data',
          undefined,
        );
      },
    },
  );

  const publicFacet = provide(
    baggage,
    `${contractName} Public Facet_singleton`,
    () => makePublicFacet(),
  );

  trace(`${contractName} contract started successfully`);
  return {
    publicFacet,
  };
};
