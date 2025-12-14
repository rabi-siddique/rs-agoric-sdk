#!/bin/bash

# Build using esbuild for Axelar
yarn gen-bundles || exit 1

# wait for 3 seconds
sleep 5

# Run the Axelar GMP deployment script
agoric run ./deploy/start-build.js \
  --net=devnet \
  --peer=noble:connection-13:channel-11:uusdc \
  --peer=axelar:connection-19:channel-315:uaxl || exit 1