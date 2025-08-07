// @ts-check
import { E } from '@endo/eventual-send';
import { Far } from '@endo/far';

const { Fail } = assert;

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

  storageNode || Fail`storageNode is required`;
  marshaller || Fail`marshaller is required`;

  /**
   * @param {string} path
   * @param {any} data
   */
  const pushToVStorage = async (path, data) => {
    const entry = {
      path,
      data,
    };

    console.log(`[VStoragePusher] Pushing to ${path}:`, data);
    const pathNode = E(storageNode).makeChildNode(path);

    // Serialize and store the data
    const serializedData = marshaller.toCapData(entry);
    await E(pathNode).setValue(JSON.stringify(serializedData));

    return { success: true };
  };

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
          pushToVStorage(vPath, vData);
          seat.exit();
        },
        'pushToVStorage',
        undefined,
      );
    },
  });

  console.log('vStoragePusherV1 started successfully');
  return { publicFacet };
};
