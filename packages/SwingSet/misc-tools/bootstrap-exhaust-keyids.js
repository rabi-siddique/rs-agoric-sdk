// @ts-nocheck
/* eslint-disable */
import { E } from '@endo/eventual-send';
import { Far } from '@endo/marshal';
import { defineKind } from '@agoric/vat-data';

export function buildRootObject() {
  let count = 0;
  const makeHolder = defineKind('holder', () => ({ held: 0 }), {
    hold: ({ state }, value) => {
      count += 1;
      state.held = value;
    },
  });
  const holder = makeHolder();
  const makeHeld = defineKind('held', () => ({}), {});

  return Far('root', {
    async bootstrap(vats, devices) {
      holder.hold(makeHeld());
      holder.hold(makeHeld());
      console.log(`count: ${count}`);
    },

    async more() {
      for (let i = 0; i < 100; i++) {
        holder.hold(makeHeld());
      }
      console.log(`count: ${count}`);
    },
  });
}
