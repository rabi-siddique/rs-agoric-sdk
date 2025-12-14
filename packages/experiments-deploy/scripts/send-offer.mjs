#!/usr/bin/env node
// @ts-check
import { contractName } from 'agoric-contract-experiments/src/name.js';
import './lockdown.mjs';
import { prepareOffer, processWalletOffer } from './utils.mjs';

const OFFER_FILE = 'offer.json';
const CONTAINER_PATH = `/usr/src/${OFFER_FILE}`;
const FROM_ADDRESS = 'agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q';
const { log, error } = console;

try {
  log('--- Creating LCA ---');

  log('Preparing offer...');

  const offer = await prepareOffer({
    publicInvitationMaker: 'createLCA',
    instanceName: contractName,
    source: 'contract',
    brandName: 'BLD',
    amount: 20_000_000n,
    offerArgs: {
      destinationEVMChain: 'Avalanche',
      destinationAddress: '0x2B3545638859C49df84660eA2D110f82F2e80De8',
    },
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
