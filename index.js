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

//STEP-1 Generating a new wallet keypair
const mnemonic = bip39.generateMnemonic();
console.log('Mnemonic:', mnemonic);

const seed = bip39.mnemonicToSeedSync(mnemonic);
console.log('Seed:', seed.toString('hex'));

//STEP-2 Deriving a wallet keypair from the seed
const derivedSeed = seed.slice(0, 32);
const walletKeyPair = Keypair.fromSeed(derivedSeed);
console.log('Wallet Key Pair:', walletKeyPair);

//STEP-3 Storing the public and private key
const publicKey = new PublicKey(walletKeyPair.publicKey).toString();
const secretKey = walletKeyPair.secretKey;

//STEP-4 Getting the wallet Balance
const getWalletBalance = async () => {
  try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const myWallet = await Keypair.fromSecretKey(secretKey);
    const walletBalance = await connection.getBalance(
      new PublicKey(myWallet.publicKey)
    );
    console.log(`=> For wallet address ${publicKey}`);
    console.log(`   Wallet balance: ${parseInt(walletBalance)/LAMPORTS_PER_SOL} SOL`);
  } catch (err) {
    console.log(err);
  }
};

//STEP-5 Air dropping SOL (in terms of LAMPORTS)
const airDropSol = async () => {
  try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const walletKeyPair = await Keypair.fromSecretKey(secretKey);
    console.log(`-- Airdropping 2 SOL --`)
    const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(walletKeyPair.publicKey),
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(fromAirDropSignature);
  } catch (err) {
    console.log(err);
  }
};

//STEP-6 Driver function
const driverFunction = async () => {
    await getWalletBalance();
    await airDropSol();
    await getWalletBalance();
}
driverFunction();
