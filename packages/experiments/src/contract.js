// @ts-check
import { Far } from '@endo/far';
import { E } from '@endo/eventual-send';

const { Fail } = assert;

/**
 * * @import {Marshaller, StorageNode} from '@agoric/internal/src/lib-chainStorage.js';
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
 * @param {ZCF} _zcf
 * @param {{
 *   storageNode: StorageNode,
 *   marshaller: Marshaller
 * }} privateArgs
 */
export const start = async (_zcf, privateArgs) => {
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

  const publicFacet = Far('VStoragePusher Public Facet', {
    pushToVStorage,
  });

  console.log('vStoragePusher started successfully');
  return { publicFacet };
};
