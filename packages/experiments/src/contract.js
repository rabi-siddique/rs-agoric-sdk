import { E } from '@endo/far';
import { prepareExo } from '@agoric/vat-data';
import { M } from '@agoric/store';
import { makeTracer } from '@agoric/internal';

const trace = makeTracer('vstoragePusher');

/**
 * @typedef {{
 *   vPath: string,
 *   vData: any,
 * }} PushOfferArgs
 */

/**
 * A basic smart contract that pushes data to vstorage paths
 *
 * @param {ZCF} zcf
 * @param {{
 *   storageNode: StorageNode,
 *   marshaller: Marshaller
 * }} privateArgs
 * @param {MapStore<any, any>} baggage
 */
export const start = async (zcf, { storageNode, marshaller }, baggage) => {
  trace('contract started...');
  const publicFacet = prepareExo(
    baggage,
    'vstoragePusher Public Facet',
    M.interface('vstoragePusher PF', {
      vPusherInvitation: M.call().returns(M.any()),
    }),
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

  trace('contract started successfully - v2');
  return {
    publicFacet,
  };
};
