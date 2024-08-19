import "dotenv/config"
import {
    Cluster,
    Connection,
    Keypair,
    PublicKey,
    clusterApiUrl,
} from '@solana/web3.js'
import {
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from '@solana/spl-token'
import "dotenv/config"
import { secretToUint8Array } from '../utils'

const cluster = process.env.CONNECTION_CLUSTER as Cluster
const secretKey = secretToUint8Array(process.env.SECRET_KEY)
const tokenMintAddress = 'A9FuuJQUpREZY8ZhX9VWtZXZHMDsZrmuFF2oqPZJxQLL'


async function mintNewTokens(tokenMintAddress: string, amount: number): Promise<void> {
    const connection = new Connection(clusterApiUrl(cluster), 'confirmed')

    const payer = Keypair.fromSecretKey(secretKey)

    const mint = new PublicKey(tokenMintAddress)

    const { address } = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey
    )

    const destination = new PublicKey(address)

    const signature = await mintTo(
        connection,
        payer,
        mint,
        destination,
        payer.publicKey,
        amount
    )

    console.log(`Mint ${amount} tokens to ${destination.toBase58()}`)
    console.log(`Tx Signature: ${signature}`)
}

const amountToMint = 1000

mintNewTokens(tokenMintAddress, amountToMint).catch((error) => {
    console.error('Error', error)
})
