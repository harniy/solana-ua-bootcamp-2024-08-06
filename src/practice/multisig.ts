import "dotenv/config";
import { 
  Cluster, 
  clusterApiUrl, 
  Connection, 
  Keypair, 
  PublicKey } from "@solana/web3.js";
import {
  createMultisig,
  TOKEN_PROGRAM_ID,
  mintTo,
  createMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { secretToUint8Array } from "../utils";

const secretKey = secretToUint8Array(process.env.SECRET_KEY);
const cluster = process.env.CONNECTION_CLUSTER as Cluster;

const connection = new Connection(clusterApiUrl(cluster));

const participant1 = Keypair.fromSecretKey(secretKey);
const participant2 = Keypair.generate();
const participant3 = Keypair.generate();
const participantPublicKeys = [participant1.publicKey, participant2.publicKey, participant3.publicKey];

async function createMultisigAccount() {
  const multisigAccount = Keypair.generate();

  const multisigPubkey = await createMultisig(
    connection,
    participant1,
    participantPublicKeys,
    2,
    multisigAccount,
    undefined,
    TOKEN_PROGRAM_ID
  );

  console.log("Multisig Pubkey:", multisigPubkey.toBase58());
  return multisigPubkey;
}

async function createTokenMint(multisigPubkey: PublicKey) {
  const mintAuthority = multisigPubkey;
  const freezeAuthority = null;

  const mint = await createMint(connection, participant1, mintAuthority, freezeAuthority, 9);

  console.log("Mint:", mint.toBase58());
  return mint;
}

async function mintTokens(mint: PublicKey, multisigPubkey: PublicKey, destination: PublicKey) {
  const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    participant1,
    mint,
    destination 
  );

  const signature = await mintTo(
    connection,
    participant1,
    mint,
    associatedTokenAccount.address,
    multisigPubkey,
    1000000000,
    [participant1, participant2, participant3]
  );
  console.log("Mint transaction signature:", signature);
}

async function main() {
  const multisigPubkey = await createMultisigAccount();
  const tokenMint = await createTokenMint(multisigPubkey);
  await mintTokens(tokenMint, multisigPubkey, participant1.publicKey);
}

main().catch(console.error);
