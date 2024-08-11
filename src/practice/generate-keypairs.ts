import { Keypair } from "@solana/web3.js"

const keypair: Keypair = new Keypair()

console.log(keypair)
console.log(`User PublicKey: ${keypair.publicKey.toBase58()}`)
