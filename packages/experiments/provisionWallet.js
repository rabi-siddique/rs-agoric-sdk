const TRANSACTION_STATUS = {
  FAILED: 1000,
  NOT_FOUND: 1001,
  SUCCESSFUL: 1002,
};

const AGORIC_NET = 'devnet';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const getStatus = async txHash => {
  const statusUrl = `https://${AGORIC_NET}.faucet.agoric.net/api/transaction-status/${txHash}`;
  const res = await fetch(statusUrl);
  if (!res.ok) throw new Error(`Failed to get status: ${res.status}`);
  const data = await res.json();

  if (data.transactionStatus === TRANSACTION_STATUS.NOT_FOUND) {
    await wait(2000);
    return getStatus(txHash);
  }

  return data.transactionStatus;
};

const provisionFromFaucet = async (walletAddress, command) => {
  const faucetUrl = `https://${AGORIC_NET}.faucet.agoric.net/go`;

  const form = new URLSearchParams({
    address: walletAddress,
    command,
    clientType: 'SMART_WALLET',
  });

  const res = await fetch(faucetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
    redirect: 'manual',
  });

  if (res.status !== 302) {
    const text = await res.text();
    throw new Error(`Expected 302 redirect, got ${res.status}\nBody:\n${text}`);
  }

  const location = res.headers.get('location');
  if (!location) throw new Error('No redirect location found in response');

  const match = /\/transaction-status\/(.*)/.exec(location);
  if (!match) throw new Error('Transaction hash not found in redirect URL');

  const txHash = match[1];
  const status = await getStatus(txHash);

  if (status === TRANSACTION_STATUS.SUCCESSFUL) {
    console.log('Provisioning successful 🎉');
  } else {
    throw new Error(`Provisioning failed with status: ${status}`);
  }
};

const walletAddress = 'agoric1ee9hr0jyrxhy999y755mp862ljgycmwyp4pl7q';
const command = 'provisionSmartWallet';

(async () => {
  let count = 1;
  while (true) {
    console.log(`\n🔁 [${count}] Requesting faucet provision...`);
    try {
      await provisionFromFaucet(walletAddress, command);
    } catch (err) {
      console.error(`⚠️ Error: ${err.message}`);
    }
    await wait(5000); // wait 5 seconds between each run
    count++;
  }
})();
