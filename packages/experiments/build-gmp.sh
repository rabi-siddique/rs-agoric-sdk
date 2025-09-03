#!/bin/bash

# Navigate to orchestration directory
cd ../orchestration || exit 1

# Build using esbuild for Axelar
yarn esbuild:axelar || exit 1

# Return to base directory
cd .. || exit 1

# Run the Axelar GMP deployment script
agoric run builders/scripts/orchestration/axelar-gmp.build.js \
  --net=devnet \
  --peer=noble:connection-13:channel-11:uusdc \
  --peer=axelar:connection-19:channel-315:uaxl || exit 1

# Copy plan file to destination
cp /home/rabi/Desktop/Agoric/rs-agoric-sdk/packages/startAxelarGmp-plan.json \
  /home/rabi/Desktop/Agoric/rs-agoric-sdk/packages/experiments || exit 1

cp /home/rabi/Desktop/Agoric/rs-agoric-sdk/packages/startAxelarGmp-permit.json \
  /home/rabi/Desktop/Agoric/rs-agoric-sdk/packages/experiments || exit 1

cp /home/rabi/Desktop/Agoric/rs-agoric-sdk/packages/startAxelarGmp.js \
  /home/rabi/Desktop/Agoric/rs-agoric-sdk/packages/experiments || exit 1
