import "dotenv/config"
import {
    Cluster,
    clusterApiUrl,
    Connection,
    Keypair,
    LAMPORTS_PER_SOL
} from "@solana/web3.js"
import { secretToUint8Array } from "../utils"

const secretKey = secretToUint8Array(process.env.SECRET_KEY)
const cluster = process.env.CONNECTION_CLUSTER as Cluster

const keypair = Keypair.fromSecretKey(secretKey)
const publicKey = keypair.publicKey

const connection = new Connection(clusterApiUrl(cluster))

const balance = await connection.getBalance(publicKey)
const normalizedBalance = balance / LAMPORTS_PER_SOL

console.log(`Balance ${publicKey.toBase58()}: ${normalizedBalance} SOL`)