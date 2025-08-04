#!/bin/bash

# Configuration
WALLET="agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q"
COMMAND="send_bld_ibc"
AMOUNT="25"
URL="https://devnet.faucet.agoric.net/go"


count=1
while true; do
  echo -e "\n🔁 [$count] Requesting faucet for $WALLET"

  curl "$URL" \
    -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8' \
    -H 'accept-language: en-US,en;q=0.8' \
    -H 'cache-control: no-cache' \
    -H 'content-type: application/x-www-form-urlencoded' \
    -b '_cfuvid=APSD5vXKPBD8QI5mYdc7GC.cl1JhrQB8wirGdN8zsUs-1754281438031-0.0.1.1-604800000; __cf_bm=61RkOZFvLDHh6TWnw4wurPpJBGD7NalsWzES3vFvo9A-1754292168-1.0.1.1-pLVMksAk3sMQDwW2a_nsqjCzNf1z4OFElNVVoUgfwmDlbuwcRsVjzcDw8qAhLqqohzIOu1IwGFKVjDMbumOPwOpmG5vVe_8._vA.BM_JtVI' \
    -H 'origin: https://devnet.faucet.agoric.net' \
    -H 'pragma: no-cache' \
    -H 'priority: u=0, i' \
    -H 'referer: https://devnet.faucet.agoric.net/' \
    -H 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138", "Brave";v="138"' \
    -H 'sec-ch-ua-mobile: ?0' \
    -H 'sec-ch-ua-platform: "Linux"' \
    -H 'sec-fetch-dest: document' \
    -H 'sec-fetch-mode: navigate' \
    -H 'sec-fetch-site: same-origin' \
    -H 'sec-fetch-user: ?1' \
    -H 'sec-gpc: 1' \
    -H 'upgrade-insecure-requests: 1' \
    -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' \
    --data-raw "address=${WALLET}&command=${COMMAND}&clientType=SMART_WALLET&amount=${AMOUNT}"

  echo -e "\n⏳ Waiting 5 seconds before next request..."
  sleep 5
  ((count++))
done
