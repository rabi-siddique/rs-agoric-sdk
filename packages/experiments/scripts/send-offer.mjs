#!/usr/bin/env node
// @ts-check
import './lockdown.mjs';
import { prepareOffer, processWalletOffer } from './utils.mjs';

const OFFER_FILE = 'offer.json';
const CONTAINER_PATH = `/usr/src/${OFFER_FILE}`;
const FROM_ADDRESS = 'agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q';
const { log, error } = console;

try {
  log('Preparing offer to increment counter...');
  const offer = await prepareOffer({
    publicInvitationMaker: 'setCounterInvitation',
    instanceName: 'counterv2',
    // brandName: 'BLD',
    // amount: 20_000_000n,
    source: 'contract',
    offerArgs: { value: 200 },
  });

  await processWalletOffer({
    offer,
    OFFER_FILE,
    CONTAINER_PATH,
    FROM_ADDRESS,
  });
} catch (err) {
  error('ERROR:', err);
  process.exit(1);
}
