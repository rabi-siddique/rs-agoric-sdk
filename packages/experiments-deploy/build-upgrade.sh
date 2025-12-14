#!/bin/bash

# Build contract in experiments package
cd ../experiments
yarn build || exit 1
cd ../experiments-deploy

# wait for 5 seconds
sleep 5

# Run the upgrade deployment script
agoric run ./src/upgrade-builder.js \
  --net=devnet \
  --peer=noble:connection-13:channel-11:uusdc \
  --peer=axelar:connection-19:channel-315:uaxl || exit 1
