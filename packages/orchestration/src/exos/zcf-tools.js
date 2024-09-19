import { VowShape } from '@agoric/vow';

/**
 * @import {HostInterface, HostOf} from '@agoric/async-flow';
 * @import {VowTools} from '@agoric/vow';
 * @import {Zone} from '@agoric/zone';
 * @import {ZcfTools} from '../types.js';
 */

import { M } from '@endo/patterns';

export const ZcfToolsI = M.interface(
  'ZCF',
  {
    makeInvitation: M.call(M.remotable('OfferHandler'), M.string())
      .optional(M.record(), M.pattern())
      .returns(VowShape),
  },
  {
    defaultGuards: 'passable',
  },
);

/**
 * @param {ZCF} zcf
 * @param {Zone} zone
 * @param {VowTools} vowTools
 */
export const prepareZcfTools = (zcf, zone, vowTools) => {
  /** @satisfies {HostInterface<ZcfTools>} */
  const zcfForFlows = zone.exo('ZcfForFlows', ZcfToolsI, {
    /**
     * Like {@link ZCF.makeEmptySeatKit}, but no userSeat is returned.
     *
     * @param {Parameters<ZCF['makeEmptySeatKit']>[0]} [exit]
     */
    makeEmptySeatKit(exit) {
      const { zcfSeat } = zcf.makeEmptySeatKit(exit);
      return harden({ zcfSeat });
    },

    /** @type {HostOf<ZCF['makeInvitation']>} */
    makeInvitation(offerHandler, description, customDetails, proposalShape) {
      return vowTools.watch(
        zcf.makeInvitation(
          offerHandler,
          description,
          customDetails,
          proposalShape,
        ),
      );
    },
    /** @type {HostOf<ZCF['makeZCFMint']>} */
    makeZCFMint(keyword, assetKind, displayInfo, options) {
      return vowTools.watch(
        zcf.makeZCFMint(keyword, assetKind, displayInfo, options),
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
    /** @type {HostOf<ZCF['getTerms']>} */
    getTerms() {
      return zcf.getTerms();
    },
  });

  return zcfForFlows;
};
