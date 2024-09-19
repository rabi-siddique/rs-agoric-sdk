import { test as anyTest } from '@agoric/zoe/tools/prepare-test-env-ava.js';

import { AmountMath, makeIssuerKit } from '@agoric/ertp';
import { prepareSwingsetVowTools } from '@agoric/vow';
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin.js';
import { makeZoeKitForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { makeNodeBundleCache } from '@endo/bundle-source/cache.js';
import { E, Far } from '@endo/far';
import type { TestFn } from 'ava';
import { createRequire } from 'node:module';
import { prepareZcfTools } from '../../src/exos/zcf-tools.js';
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
  const zcfTools = prepareZcfTools(zcf, zone, vt);
  return { zoe, zcf, stuff, feeMintAccess, zcfTools, vt };
};

type TestContext = Awaited<ReturnType<typeof makeTestContext>>;

const test = anyTest as TestFn<TestContext>;

test.before('set up context', async t => (t.context = await makeTestContext()));

test('unchanged: atomicRearrange(), ... getTerms()', async t => {
  const { zcf, zcfTools } = t.context;

  t.notThrows(() => zcfTools.atomicRearrange([]));

  t.notThrows(() => zcfTools.assertUniqueKeyword('K1'));
  t.throws(() => zcfTools.assertUniqueKeyword('Stuff'));

  t.deepEqual(zcfTools.getTerms(), zcf.getTerms());
});

test('changed: makeEmptySeatKit: remove userSeat', async t => {
  const { zcf, zcfTools } = t.context;

  const kit = zcfTools.makeEmptySeatKit();
  t.deepEqual(Object.keys(kit), ['zcfSeat']);

  const { zcfSeat } = kit;
  t.falsy(zcfSeat.hasExited(), 'zcfSeat works as usual');
});

test('changed: makeInvitation: watch promise', async t => {
  const { zoe, zcf, zcfTools, vt } = t.context;

  const handler = Far('Trade', { handle: seat => {} });
  const toTradeVow = zcfTools.makeInvitation(handler, 'trade');

  const toTrade = await vt.when(toTradeVow);
  const amt = await E(E(zoe).getInvitationIssuer()).getAmountOf(toTrade);
  t.like(amt, { value: [{ description: 'trade' }] });
});

test('removed: makeInvitation: non-passable handler', async t => {
  const { zcfTools } = t.context;

  t.throws(() => zcfTools.makeInvitation(_seat => {}, 'trade'), {
    message: /Remotables must be explicitly declared/,
  });
});

test('changed: makeZCFMint - watch', async t => {
  const { zcf, zcfTools, vt } = t.context;

  const m1Vow = zcfTools.makeZCFMint('M1');
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
