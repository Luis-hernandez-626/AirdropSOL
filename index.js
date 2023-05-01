const express = require('express');
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  Account,
} = require("@solana/web3.js");
const bip39 = require('bip39');

const app = express();

const driverFunction = async () => {
  try {
    //STEP-1 Generating a new wallet keypair
    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const newPair = Keypair.generate();
    console.log(`New keypair generated for wallet address ${newPair.publicKey.toBase58()}`);

    //STEP-2 Storing the public and private key
    const publicKey = new PublicKey(newPair.publicKey).toString();
    const secretKey = newPair.secretKey;

    //STEP-3 Getting the wallet Balance
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const myWallet = await Keypair.fromSecretKey(secretKey);
    const walletBalance = await connection.getBalance(
      new PublicKey(myWallet.publicKey)
    );
    console.log(`=> For wallet address ${publicKey}`);
    console.log(`   Wallet balance: ${parseInt(walletBalance)/LAMPORTS_PER_SOL}SOL`);

    //STEP-4 Air dropping SOL (in terms of LAMPORTS)
    console.log(`-- Airdropping 2 SOL --`)
    const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(myWallet.publicKey),
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(fromAirDropSignature);

    //STEP-5 Getting wallet balance after airdrop
    const walletBalanceAfter = await connection.getBalance(
      new PublicKey(myWallet.publicKey)
    );
    console.log(`   Wallet balance after airdrop: ${parseInt(walletBalanceAfter)/LAMPORTS_PER_SOL}SOL`);
    
    return {
      mnemonic,
      publicKey,
      secretKey,
      walletBalance,
      walletBalanceAfter
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

app.get('/', async (req, res) => {
  try {
    const result = await driverFunction();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

const port = 8080;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
