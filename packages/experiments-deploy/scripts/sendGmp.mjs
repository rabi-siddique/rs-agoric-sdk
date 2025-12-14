#!/usr/bin/env node
// @ts-check
import { contractName } from 'agoric-contract-experiments/src/name.js';
import './lockdown.mjs';
import { prepareOffer, processWalletOffer } from './utils.mjs';

const OFFER_FILE = 'offer.json';
const CONTAINER_PATH = `/usr/src/${OFFER_FILE}`;
const FROM_ADDRESS = 'agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q';
const { log, error } = console;

// The offer ID from the previous createlcaAndGmp offer
const PREVIOUS_OFFER_ID = 'offer-1765719250677';

try {
  log('--- Sending GMP Message via InvitationMakers ---');

  log('Preparing offer...');
  const offer = await prepareOffer({
    instanceName: contractName,
    source: 'continuing',
    previousOffer: PREVIOUS_OFFER_ID,
    invitationMakerName: 'makeEVMTransactionInvitation',
    invitationArgs: [
      'sendGmp',
      [
        {
          destinationEVMChain: 'Avalanche',
          destinationAddress: '0x2B3545638859C49df84660eA2D110f82F2e80De8',
        },
      ],
    ],
    brandName: 'BLD',
    amount: 20_000_000n,
  });

  await processWalletOffer({
    offer,
    OFFER_FILE,
    CONTAINER_PATH,
    FROM_ADDRESS,
  });

  log('✅ GMP message sent successfully!');
} catch (err) {
  error('ERROR:', err);
  process.exit(1);
}
