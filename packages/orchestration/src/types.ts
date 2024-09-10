/** @file Rollup of all type definitions in the package, for local import and external export */

import type { HostOf } from '@agoric/async-flow';
import { prepareZcfForFlows } from './exos/zcf-for-flow.js';

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
 * Partial Zoe Contract Facet ({@link ZCF}) for use in {@link OrchestrationFlow}s.
 *
 * @see {@link HostOf} for the analogy between `Promise` and `Vow`.
 * @interface
 */
export type ZcfForFlows = ReturnType<typeof prepareZcfForFlows>;
