#!/usr/bin/env node
// @ts-check
import './lockdown.mjs';
import { prepareOffer, processWalletOffer } from './utils.mjs';

const OFFER_FILE = 'offer.json';
const CONTAINER_PATH = `/usr/src/${OFFER_FILE}`;
const FROM_ADDRESS = 'agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q';
const { log, error } = console;

// The offer ID from the previous createlcaAndGmp offer
const PREVIOUS_OFFER_ID = 'offer-1765434629993';

try {
  log('--- Sending GMP Message via InvitationMakers ---');

  log('Preparing offer...');
  const offer = await prepareOffer({
    instanceName: 'createlcaAndGmpV3',
    source: 'continuing',
    previousOffer: PREVIOUS_OFFER_ID,
    invitationMakerName: 'makeEVMTransactionInvitation',
    invitationArgs: [
      'sendGmp',
      [
        {
          destinationAddress: '0x2B3545638859C49df84660eA2D110f82F2e80De8',
          type: 1,
          destinationEVMChain: 'Avalanche',
          gasAmount: 15_000_000,
          contractInvocationData: [],
        },
      ],
    ],
    brandName: 'BLD',
    amount: 15_000_000n,
  });

  await processWalletOffer({
    offer,
    OFFER_FILE,
    CONTAINER_PATH,
    FROM_ADDRESS,
  });

  log('✅ GMP message sent successfully!');
} catch (err) {
  error('ERROR:', err.shortMessage || err.message);
  process.exit(1);
}
