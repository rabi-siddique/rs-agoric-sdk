import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { prepareSwingsetVowTools } from '@agoric/vow';
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin.js';
import { makeZoeKitForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { makeNodeBundleCache } from '@endo/bundle-source/cache.js';
import { E, Far } from '@endo/far';
import type { TestFn } from 'ava';
import { createRequire } from 'node:module';
import { prepareZcfForFlows } from '../../src/exos/zcf-for-flow.js';
import { provideDurableZone } from '../supports.js';

const nodeRequire = createRequire(import.meta.url);
const contractEntry = nodeRequire.resolve('../fixtures/zcfTester.contract.js');

const makeTestContext = async () => {
  let testJig;
  const setJig = jig => (testJig = jig);
  const fakeVatAdmin = makeFakeVatAdmin(setJig);
  const { zoeService: zoe, feeMintAccess } = makeZoeKitForTest(
    fakeVatAdmin.admin,
  );

  const bundleCache = await makeNodeBundleCache('bundles', {}, s => import(s));
  const contractBundle = await bundleCache.load(contractEntry);

  fakeVatAdmin.vatAdminState.installBundle('b1-contract', contractBundle);
  const installation = await E(zoe).installBundleID('b1-contract');

  const stuff = makeIssuerKit('Stuff');
  await E(zoe).startInstance(installation, { Stuff: stuff.issuer });
  assert(testJig, 'startInstance did not call back to setTestJig');

  const zcf: ZCF = testJig.zcf;

  const zone = provideDurableZone('root');
  const vt = prepareSwingsetVowTools(zone);
  const zcfLtd = prepareZcfForFlows(zcf, zone, vt);
  return { zoe, zcf, stuff, feeMintAccess, zcfLtd, vt };
};

type TestContext = Awaited<ReturnType<typeof makeTestContext>>;

const test = anyTest as TestFn<TestContext>;

test.before('set up context', async t => (t.context = await makeTestContext()));

test('unchanged: atomicRearrange(), ... getTerms()', async t => {
  const { zcf, zcfLtd } = t.context;

  t.notThrows(() => zcfLtd.atomicRearrange([]));

  t.notThrows(() => zcfLtd.assertUniqueKeyword('K1'));
  t.throws(() => zcfLtd.assertUniqueKeyword('Stuff'));

  t.deepEqual(zcfLtd.getTerms(), zcf.getTerms());
});

test('changed: makeEmptySeatKit: remove userSeat', async t => {
  const { zcf, zcfLtd } = t.context;

  const kit = zcfLtd.makeEmptySeatKit();
  t.deepEqual(Object.keys(kit), ['zcfSeat']);

  const { zcfSeat } = kit;
  t.falsy(zcfSeat.hasExited(), 'zcfSeat works as usual');
});

test('changed: makeInvitation: watch promise', async t => {
  const { zoe, zcf, zcfLtd, vt } = t.context;

  const handler = Far('Trade', { handle: seat => {} });
  const toTradeVow = zcfLtd.makeInvitation(handler, 'trade');

  const toTrade = await vt.when(toTradeVow);
  const amt = await E(E(zoe).getInvitationIssuer()).getAmountOf(toTrade);
  t.like(amt, { value: [{ description: 'trade' }] });
});

test('removed: makeInvitation: non-passable handler', async t => {
  const { zcfLtd } = t.context;

  t.throws(() => zcfLtd.makeInvitation(_seat => {}, 'trade'), {
    message: /Remotables must be explicitly declared/,
  });
});

test('changed: makeZCFMint - watch', async t => {
  const { zcf, zcfLtd, vt } = t.context;

  const m1Vow = zcfLtd.makeZCFMint('M1');
  const m1 = await vt.when(m1Vow);

  // m1 works like any other ZCF Mint
  const kit = m1.getIssuerRecord();
  t.deepEqual(Object.keys(kit), [
    'brand',
    'issuer',
    'assetKind',
    'displayInfo',
  ]);
  // @ts-expect-error something odd about HostInterface
  const anAmount = AmountMath.make(kit.brand, 123n);
  const aSeat = m1.mintGains({ Out: anAmount });
  t.like(aSeat.getCurrentAllocation(), { Out: { value: 123n } });
});

test('removed: saveIssuer(), ... getOfferFilter()', async t => {
  const { zcfLtd, stuff, feeMintAccess } = t.context;

  // @ts-expect-error
  t.throws(() => zcfLtd.saveIssuer('T2', stuff.issuer), {
    message: /not a function/,
  });

  // @ts-expect-error
  t.throws(() => zcfLtd.shutdown('done'), {
    message: /not a function/,
  });

  // @ts-expect-error
  t.throws(() => zcfLtd.shutdownWithFailure(Error('oops')), {
    message: /not a function/,
  });

  // @ts-expect-error
  t.throws(() => zcfLtd.stopAcceptingOffers(), {
    message: /not a function/,
  });

  // @ts-expect-error
  t.throws(() => zcfLtd.registerFeeMint('Fee', feeMintAccess), {
    message: /not a function/,
  });

  // @ts-expect-error
  t.throws(() => zcfLtd.getZoeService(), {
    message: /not a function/,
  });

  // @ts-expect-error
  t.throws(() => zcfLtd.getInvitationIssuer(), {
    message: /not a function/,
  });

  // @ts-expect-error
  t.throws(() => zcfLtd.getBrandForIssuer(stuff.issuer), {
    message: /not a function/,
  });

  // @ts-expect-error
  t.throws(() => zcfLtd.getIssuerForBrand(stuff.brand), {
    message: /not a function/,
  });

  // @ts-expect-error
  t.throws(() => zcfLtd.getAssetKind(stuff.brand), {
    message: /not a function/,
  });

  // @ts-expect-error
  t.throws(() => zcfLtd.setTestJig(() => ({})), {
    message: /not a function/,
  });

  // @ts-expect-error
  t.throws(() => zcfLtd.getInstance(), {
    message: /not a function/,
  });

  // @ts-expect-error
  t.throws(() => zcfLtd.setOfferFilter(['trade']), {
    message: /not a function/,
  });

  const [seat1, seat2] = [Far('S1', {}), Far('S2', {})];
  // @ts-expect-error
  t.throws(() => zcfLtd.reallocate(seat1, seat2), {
    message: /not a function/,
  });

  // @ts-expect-error
  await t.throwsAsync(async () => zcfLtd.getOfferFilter(), {
    message: /not a function/,
  });
});
