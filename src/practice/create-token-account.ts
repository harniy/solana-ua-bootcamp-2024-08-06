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
} from '@solana/spl-token'
import "dotenv/config"
import { secretToUint8Array } from '../utils'

const cluster = process.env.CONNECTION_CLUSTER as Cluster
const secretKey = secretToUint8Array(process.env.SECRET_KEY)
const tokenMintAddress = 'A9FuuJQUpREZY8ZhX9VWtZXZHMDsZrmuFF2oqPZJxQLL'

async function createTokenAccount(tokenMintAddress: string): Promise<void> {
    const connection = new Connection(clusterApiUrl(cluster), 'confirmed')

    const payer = Keypair.fromSecretKey(secretKey)
    const mint = new PublicKey(tokenMintAddress)

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        payer.publicKey
    )

    console.log('Associated token account:', tokenAccount.address.toBase58())
}

createTokenAccount(tokenMintAddress).catch((error) => {
    console.error('Error', error)
})
