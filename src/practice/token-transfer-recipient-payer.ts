import "dotenv/config"
import { Cluster, clusterApiUrl, Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js"
import { secretToUint8Array } from "../utils"
import { createTransferInstruction, getOrCreateAssociatedTokenAccount, getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token"

const secretKey = secretToUint8Array(process.env.SECRET_KEY)
const sender = Keypair.fromSecretKey(secretKey)

const cluster = process.env.CONNECTION_CLUSTER as Cluster
const connection = new Connection(clusterApiUrl(cluster), 'confirmed')

const recipient = Keypair.fromSecretKey(secretToUint8Array(process.env.RECIPIENT_SECRET_KEY))

const tokenMintAddress = new PublicKey('A9FuuJQUpREZY8ZhX9VWtZXZHMDsZrmuFF2oqPZJxQLL')

async function createUnsignedTransactionForRecipient(
    connection: Connection,
    sender: Keypair,
    recipientPubkey: PublicKey,
    mintPubkey: PublicKey,
    amount: number
) {
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        sender,
        mintPubkey,
        sender.publicKey
    )

    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        sender,
        mintPubkey,
        recipientPubkey
    )

    const senderAccountInfo = await connection.getAccountInfo(senderTokenAccount.address)
    const recipientAccountInfo = await connection.getAccountInfo(recipientTokenAccount.address)

    if (!senderAccountInfo || !recipientAccountInfo) {
        throw new Error('Token account information missing')
    }

    const senderTokenAccountData = await getAccount(connection, senderTokenAccount.address)
    if (senderTokenAccountData.amount < amount) {
        throw new Error('Insufficient token balance')
    }

    const transferInstruction = createTransferInstruction(
        senderTokenAccount.address,  
        recipientTokenAccount.address,
        sender.publicKey,           
        amount                    
    )

    const transaction = new Transaction().add(transferInstruction)

    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
    transaction.feePayer = recipientPubkey

    transaction.partialSign(sender)

    return transaction
}

async function main() {
    try {
        const transaction = await createUnsignedTransactionForRecipient(
            connection,
            sender,
            recipient.publicKey,
            tokenMintAddress,
            1000000000
        )

        transaction.partialSign(recipient)

        const serializedTransaction = transaction.serialize()
        const signature = await connection.sendRawTransaction(serializedTransaction)

        console.log('SENDER: ', sender.publicKey.toBase58())
        console.log('RECIPIENT: ', recipient.publicKey.toBase58())
        console.log('Transaction signature:', signature)
    } catch (error) {
        console.error('Error:', error)
    }
}

main().catch(err => {
    console.error('Error:', err)
})
