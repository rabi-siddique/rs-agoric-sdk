import { prepareExo } from '@agoric/vat-data';
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
  trace(`${contractName} contract started...`);

  if (!baggage.has('counter')) {
    trace('init counter');
    baggage.init('counter', 0);
  }

  const publicFacet = prepareExo(
    baggage,
    'Counter Public Facet',
    M.interface('Counter PF', {
      incrementInvitation: M.call().returns(M.any()),
      decrementInvitation: M.call().returns(M.any()),
    }),
    {
      incrementInvitation() {
        return zcf.makeInvitation(
          async seat => {
            const currentValue = baggage.get('counter');
            const newValue = currentValue + 1;
            baggage.set('counter', newValue);
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
            const currentValue = baggage.get('counter');
            const newValue = currentValue - 1;
            baggage.set('counter', newValue);
            trace(`Counter decremented to: ${newValue}`);
            seat.exit();
          },
          'decrement counter',
          undefined,
        );
      },
    },
  );

  trace('counter contract started successfully');
  return {
    publicFacet,
  };
};
