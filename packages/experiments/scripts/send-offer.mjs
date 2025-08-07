#!/usr/bin/env node
// @ts-check
import './lockdown.mjs';
import { prepareOffer, processWalletOffer } from './utils.mjs';

const OFFER_FILE = 'offer.json';
const CONTAINER_PATH = `/usr/src/${OFFER_FILE}`;
const FROM_ADDRESS = 'agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q';
const { makeAccount } = process.env;
const { log, error } = console;

try {
  if (makeAccount) {
    log('Preparing offer...');
    const offer = await prepareOffer({
      publicInvitationMaker: 'pushToVStorage',
      instanceName: 'vStoragePusherV1',
      brandName: 'BLD',
      amount: 20_000_000n,
      source: 'contract',
      offerArgs: {
        vPath: 'position1',
        vData: 'hello',
      },
    });

    await processWalletOffer({
      offer,
      OFFER_FILE,
      CONTAINER_PATH,
      FROM_ADDRESS,
    });
  }
} catch (err) {
  error('ERROR:', err.shortMessage || err.message);
  process.exit(1);
}
