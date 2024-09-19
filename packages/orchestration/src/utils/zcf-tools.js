/**
 * @import {HostInterface, HostOf} from '@agoric/async-flow';
 * @import {VowTools} from '@agoric/vow';
 * @import {ZcfTools} from '../types.js';
 */

import { M, mustMatch } from '@endo/patterns';

const HandlerShape = M.remotable('OfferHandler');

/**
 * @param {ZCF} zcf
 * @param {VowTools} vowTools
 */
export const makeZcfTools = (zcf, vowTools) => {
  /** @satisfies {HostInterface<ZcfTools>} */
  const zcfForFlows = harden({
    /** @type {HostOf<ZCF['makeInvitation']>} */
    makeInvitation(offerHandler, description, customDetails, proposalShape) {
      mustMatch(offerHandler, HandlerShape);
      return vowTools.watch(
        zcf.makeInvitation(
          offerHandler,
          description,
          customDetails,
          proposalShape,
        ),
      );
    },
    /** @type {ZCF['atomicRearrange']} */
    atomicRearrange(transfers) {
      zcf.atomicRearrange(transfers);
    },
    /** @type {ZCF['assertUniqueKeyword']} */
    assertUniqueKeyword(keyword) {
      zcf.assertUniqueKeyword(keyword);
    },
  });

  return zcfForFlows;
};
