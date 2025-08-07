// @ts-check
import { E } from '@endo/eventual-send';
import { Far } from '@endo/far';

/**
 * @import {Marshaller, StorageNode} from '@agoric/internal/src/lib-chainStorage.js';
 */

/**
 * @typedef {{
 *   path: string,
 *   data: any,
 * }} VStorageEntry
 */

/**
 * A basic smart contract that pushes data to vstorage paths
 *
 * @param {ZCF} zcf
 * @param {{
 *   storageNode: StorageNode,
 *   marshaller: Marshaller
 * }} privateArgs
 */
export const start = async (zcf, privateArgs) => {
  const { storageNode, marshaller } = privateArgs;

  /**
   * @typedef {{
   *   vPath: string,
   *   vData: any,
   * }} PushOfferArgs
   */

  const publicFacet = Far('pushToVStorage Public Facet', {
    pushToVStorage: () => {
      return zcf.makeInvitation(
        async (seat, /** @type {PushOfferArgs} */ offerArgs) => {
          const { vPath, vData } = offerArgs;

          console.log(`[VStoragePusher] Pushing to ${vPath}:`, vData);
          const pathNode = E(storageNode).makeChildNode(vPath);

          // Serialize and store the data
          const serializedData = marshaller.toCapData(vData);
          await E(pathNode).setValue(JSON.stringify(serializedData));

          seat.exit();
        },
        'pushToVStorage',
        undefined,
      );
    },
  });

  console.log('vStoragePusherV2 started successfully');
  return { publicFacet };
};
