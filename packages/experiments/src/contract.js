import { prepareExoClass, provide } from '@agoric/vat-data';
import { M } from '@agoric/store';
import { makeTracer } from '@agoric/internal';
import { contractName } from './name.js';

const trace = makeTracer('counter');

export const meta = { upgradability: 'canUpgrade' };

/**
 * A simple counter contract that increments a counter and logs its value
 *
 * @param {ZCF} zcf
 * @param {{}} _privateArgs
 * @param {MapStore<any, any>} baggage
 */
export const start = async (zcf, _privateArgs, baggage) => {
  const isReincarnation = baggage.has('Counter Public Facet_singleton');

  if (isReincarnation) {
    trace(`${contractName} contract REINCARNATED (upgrade)`);
  } else {
    trace(`${contractName} contract FRESH START (first deployment)`);
  }

  const makePublicFacet = prepareExoClass(
    baggage,
    'Counter Public Facet',
    M.interface('Counter PF', {
      getCounter: M.call().returns(M.number()),
      incrementInvitation: M.call().returns(M.any()),
      decrementInvitation: M.call().returns(M.any()),
    }),
    () => {
      trace('Init function called - creating new state');
      return { counter: 0 };
    },
    {
      getCounter() {
        return this.state.counter;
      },
      incrementInvitation() {
        return zcf.makeInvitation(
          async seat => {
            const currentValue = this.state.counter;
            const newValue = currentValue + 1;
            this.state.counter = newValue;
            trace(`Counter incremented to: ${newValue}`);
            seat.exit();
          },
          'increment counter',
          undefined,
        );
      },
      decrementInvitation() {
        return zcf.makeInvitation(
          async seat => {
            const currentValue = this.state.counter;
            const newValue = currentValue - 1;
            this.state.counter = newValue;
            trace(`Counter decremented to: ${newValue}`);
            seat.exit();
          },
          'decrement counter',
          undefined,
        );
      },
    },
  );

  const publicFacet = provide(baggage, 'Counter Public Facet_singleton', () =>
    makePublicFacet(),
  );

  trace('counter contract started successfully');
  return {
    publicFacet,
  };
};
