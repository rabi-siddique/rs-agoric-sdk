/** @file Rollup of all type definitions in the package, for local import and external export */

import type { HostOf } from '@agoric/async-flow';
import { prepareZcfTools } from './exos/zcf-tools.js';

export type * from './chain-info.js';
export type * from './cosmos-api.js';
export type * from './ethereum-api.js';
export type * from './exos/ica-account-kit.js';
export type * from './exos/local-chain-facade.js';
export type * from './exos/icq-connection-kit.js';
export type * from './exos/exo-interfaces.js';
export type * from './orchestration-api.js';
export type * from './exos/cosmos-interchain-service.js';
export type * from './exos/chain-hub.js';
export type * from './vat-orchestration.js';

/**
 * ({@link ZCF})-like tools for use in {@link OrchestrationFlow}s.
 *
 * @interface
 */
export type ZcfTools<CT = Record<string, unknown>> = Pick<
  ZCF<CT>,
  'atomicRearrange' | 'assertUniqueKeyword'
> & {
  makeInvitation: <R, A = undefined>(
    offerHandler: OfferHandler<ERef<R>, A>,
    description: string,
    customDetails?: object,
    proposalShape?: Pattern,
  ) => Promise<Invitation<R, A>>;
};
