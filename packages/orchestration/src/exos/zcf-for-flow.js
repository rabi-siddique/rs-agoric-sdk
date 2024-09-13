import { VowShape } from '@agoric/vow';

/**
 * @import {HostOf} from '@agoric/async-flow';
 * @import {VowTools} from '@agoric/vow';
 * @import {Zone} from '@agoric/zone';
 */

import { M } from '@endo/patterns';

export const ZcfI = M.interface(
  'ZCF',
  {
    makeInvitation: M.call(M.raw(), M.string())
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
export const prepareZcfForFlows = (zcf, zone, vowTools) => {
  const zcfForFlows = zone.exo('ZcfForFlows', ZcfI, {
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
    makeInvitation(offerHandler, description, customDetails) {
      return vowTools.watch(
        zcf.makeInvitation(offerHandler, description, customDetails),
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
      return zcf.atomicRearrange(transfers);
    },
    /** @type {ZCF['assertUniqueKeyword']} */
    assertUniqueKeyword(keyword) {
      return zcf.assertUniqueKeyword(keyword);
    },
    /** @type {ZCF['getTerms']} */
    getTerms() {
      return zcf.getTerms();
    },
  });

  return zcfForFlows;
};
