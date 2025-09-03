#!/usr/bin/env node
// @ts-check
import './lockdown.mjs';
import {
  fetchFromVStorage,
  poll,
  prepareOffer,
  processWalletOffer,
  validateEvmAddress,
} from './utils.mjs';

const OFFER_FILE = 'offer.json';
const CONTAINER_PATH = `/usr/src/${OFFER_FILE}`;
const FROM_ADDRESS = 'agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q';
const { log, error } = console;

try {
  log('--- Creating NFA ---');

  log('Preparing offer...');
  // worked with v2: https://www.mintscan.io/noble-testnet/tx/557963B572E3C8B4CF9870EE7279B487468D783A4D8B28E7DCB86944A20F1BBC?sector=logs
  const offer = await prepareOffer({
    publicInvitationMaker: 'createNfa',
    instanceName: 'createNfaV2',
    brandName: 'BLD',
    amount: 20_000_000n,
    source: 'contract',
  });

  await processWalletOffer({
    offer,
    OFFER_FILE,
    CONTAINER_PATH,
    FROM_ADDRESS,
  });
} catch (err) {
  error('ERROR:', err.shortMessage || err.message);
  process.exit(1);
}
