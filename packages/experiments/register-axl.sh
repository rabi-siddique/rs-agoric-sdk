#!/bin/bash

AXL_DENOM="ibc/1BB89B43FDC33EC709F16E851DA91A095C2E0A3B3172FCD19845A7C8C4D5D6FC"

assets=$(jq -cn --arg denom "$AXL_DENOM" '[
  {
    denom: $denom,
    issuerName: "AXL",
    decimalPlaces: 6
  }
]')

echo "Generate bundles for AXL token"
cd ../..
agoric run multichain-testing/src/register-interchain-bank-assets.builder.js \
  --assets="$assets"

# Copy files to destination
cp /home/rabi/Desktop/Agoric/rs-agoric-sdk/eval-register-interchain-bank-assets-plan.json \
  /home/rabi/Desktop/Agoric/rs-agoric-sdk/packages/experiments || exit 1

cp /home/rabi/Desktop/Agoric/rs-agoric-sdk/eval-register-interchain-bank-assets-permit.json \
  /home/rabi/Desktop/Agoric/rs-agoric-sdk/packages/experiments || exit 1

cp /home/rabi/Desktop/Agoric/rs-agoric-sdk/eval-register-interchain-bank-assets.js \
  /home/rabi/Desktop/Agoric/rs-agoric-sdk/packages/experiments || exit 1
