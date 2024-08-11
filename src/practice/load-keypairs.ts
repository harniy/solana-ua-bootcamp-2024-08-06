import "dotenv/config"
import { Keypair } from "@solana/web3.js"
import { secretToUint8Array } from "../utils"

const secretKey = secretToUint8Array(process.env.SECRET_KEY)

const keypair = Keypair.fromSecretKey(secretKey)

console.log(keypair)
console.log(`User PublicKey: ${keypair.publicKey.toBase58()}`)