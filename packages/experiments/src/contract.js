// @ts-check
import { E } from '@endo/eventual-send';
import { M } from '@endo/patterns';
import { makeDurableZone } from '@agoric/zone/durable.js';

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
 * @param {import('@agoric/vat-data').Baggage} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
  const { storageNode, marshaller } = privateArgs;
  const zone = makeDurableZone(baggage);

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

  const publicFacet = zone.exo(
    'pushToVStorage Public Facet',
    M.interface('pushToVStorage', {
      pushToVStorage: M.call().returns(M.any()),
    }),
    {
      pushToVStorage() {
        return zcf.makeInvitation(
          async (seat, /** @type {PushOfferArgs} */ offerArgs) => {
            const { vPath, vData } = offerArgs;
            pushToVStorage(vPath, vData);
            seat.exit();
          },
          'increment counter',
          undefined,
        );
      },
    },
  );

  console.log('vStoragePusherV1 started successfully');
  return { publicFacet };
};
