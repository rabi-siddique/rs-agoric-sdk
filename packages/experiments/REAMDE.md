## The Problem: prepareExo + Interface Changes = Baggage Corruption

Your contract uses the same baggage object for TWO purposes:
1. Storing your counter: baggage.init('counter', 0)
2. Passed to prepareExo(baggage, ...) which internally stores:
    - Kind handle at key: 'Counter Public Facet_kindHandle'
    - Singleton at key: 'Counter Public Facet_singleton'

When you changed the interface (adding `decrementInvitation` in the upgrade), here's what went wrong:
```js
  // OLD (v1): Only incrementInvitation
  prepareExo(baggage, 'Counter Public Facet',
    M.interface('Counter PF', {
      incrementInvitation: M.call().returns(M.any()),
    }), ...)

  // NEW (v2): Added decrementInvitation
  prepareExo(baggage, 'Counter Public Facet',
    M.interface('Counter PF', {
      incrementInvitation: M.call().returns(M.any()),
      decrementInvitation: M.call().returns(M.any()),  // ← INTERFACE CHANGED!
    }), ...)
```

## What Happens Internally

From `vat-data/src/exo-utils.js:305-322`:
```js
  const prepareExo = (baggage, kindName, interfaceGuard, methods, ...) => {
    const makeSingleton = prepareExoClass(baggage, kindName, interfaceGuard, ...);
    return provide(baggage, `${kindName}_singleton`, () => makeSingleton());
  };
```

On upgrade:
1. `prepareExoClass` tries to redefine the durable kind with the NEW interface
2. The existing singleton (stored in baggage) was created with the OLD interface
3. This creates an incompatibility - the stored singleton doesn't match the new kind definition
4. This conflict can corrupt or clear the baggage namespace, affecting ALL keys including your 'counter' key!