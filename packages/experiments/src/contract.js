import { prepareExo } from '@agoric/vat-data';
import { M } from '@agoric/store';
import { makeTracer } from '@agoric/internal';
import { contractName } from './name';

const trace = makeTracer('counter');

/**
 * A simple counter contract that increments a counter and logs its value
 *
 * @param {ZCF} zcf
 * @param {{}} privateArgs
 * @param {MapStore<any, any>} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
  trace(`${contractName} contract started...`);

  let counter = 0;

  const publicFacet = prepareExo(
    baggage,
    'Counter Public Facet',
    M.interface('Counter PF', {
      incrementInvitation: M.call().returns(M.any()),
    }),
    {
      incrementInvitation() {
        return zcf.makeInvitation(
          async seat => {
            counter += 1;
            trace(`Counter incremented to: ${counter}`);
            seat.exit();
          },
          'increment counter',
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
