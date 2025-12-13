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
      setCounterInvitation: M.call().returns(M.any()),
    }),
    () => {
      trace('Init function called - creating new state');
      return {
        counter: 0,
        label: 'v2-state',
      };
    },
    {
      getCounter() {
        trace(
          `[getCounter] label: ${this.state.label}, counter: ${this.state.counter}`,
        );
        return this.state.counter;
      },
      incrementInvitation() {
        return zcf.makeInvitation(
          async seat => {
            trace(`[increment] label: ${this.state.label}`);
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
            trace(`[decrement] label: ${this.state.label}`);
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
      setCounterInvitation() {
        return zcf.makeInvitation(
          async (seat, offerArgs) => {
            trace(`[setCounter] label: ${this.state.label}`);
            assert(offerArgs, 'offerArgs is required');
            const { value } = offerArgs;
            assert.typeof(value, 'number', 'value must be a number');
            const oldValue = this.state.counter;
            this.state.counter = value;
            trace(`Counter set from ${oldValue} to: ${value}`);
            seat.exit();
          },
          'set counter',
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
