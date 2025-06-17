import { E } from '@endo/far';
import { prepareExo } from '@agoric/vat-data';
import { M } from '@agoric/store';

let counter = 0;
export const start = async (zcf, { storageNode, timerService }, baggage) => {
  console.log('Inside the contract....');
  await E(timerService).delay(20n);
  console.log("loging this....")
  const publicFacet = prepareExo(
    baggage,
    'Counter Public Facet',
    M.interface('Counter PF', {
      getCounter: M.call().returns(M.any()),
      makeIncrementInvitation: M.call().returns(M.any()),
      makeDecrementInvitation: M.call().returns(M.any()),
    }),
    {
      getCounter() {
        return counter;
      },
      makeIncrementInvitation() {
        return zcf.makeInvitation(
          async seat => {
            seat.exit();
            counter += 1;
            await E(storageNode).setValue(String(counter));
            console.log('Counter Value:', counter);
          },
          'increment counter',
          undefined,
        );
      },
      makeDecrementInvitation() {
        return zcf.makeInvitation(
          async seat => {
            seat.exit();
            counter -= 1;
            await E(storageNode).setValue(String(counter));
            console.log('Counter Value:', counter);
          },
          'decrement counter',
          undefined,
        );
      },
    },
  );

  return {
    publicFacet,
  };
};
