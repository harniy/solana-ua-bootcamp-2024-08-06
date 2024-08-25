import "dotenv/config"
import { Cluster, clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, NONCE_ACCOUNT_LENGTH, NonceAccount, PublicKey, sendAndConfirmRawTransaction, SystemProgram, Transaction } from "@solana/web3.js"
import { secretToUint8Array } from "../utils"
import { createTransferInstruction, getOrCreateAssociatedTokenAccount, getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token"

const secretKey = secretToUint8Array(process.env.SECRET_KEY)
const sender = Keypair.fromSecretKey(secretKey)

const cluster = process.env.CONNECTION_CLUSTER as Cluster
const connection = new Connection(clusterApiUrl(cluster), 'confirmed')

const recipient = Keypair.fromSecretKey(secretToUint8Array(process.env.RECIPIENT_SECRET_KEY))

const tokenMintAddress = new PublicKey('A9FuuJQUpREZY8ZhX9VWtZXZHMDsZrmuFF2oqPZJxQLL')

const USE_NONCE = true
const nonceKeypair = Keypair.generate()
const nonceAuthKP = sender

if (USE_NONCE) {
    const tx = new Transaction()

    tx.feePayer = nonceAuthKP.publicKey

    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    tx.add(
        SystemProgram.createAccount({
            fromPubkey: nonceAuthKP.publicKey,
            newAccountPubkey: nonceKeypair.publicKey,
            lamports: 0.0015 * LAMPORTS_PER_SOL,
            space: NONCE_ACCOUNT_LENGTH,
            programId: SystemProgram.programId,
        }),
        SystemProgram.nonceInitialize({
            noncePubkey: nonceKeypair.publicKey,
            authorizedPubkey: nonceAuthKP.publicKey,
        })
    )

    tx.sign(nonceKeypair, nonceAuthKP)

    const sig = await sendAndConfirmRawTransaction(
        connection,
        tx.serialize({ requireAllSignatures: false })
    )
    console.log("Nonce initiated: ", sig)
}

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

    const transaction = new Transaction()

    let blockhash = (await connection.getLatestBlockhash()).blockhash
    if (USE_NONCE) {
        const accountInfo = await connection.getAccountInfo(nonceKeypair.publicKey)
        const nonceAccount = NonceAccount.fromAccountData(accountInfo.data)

        const advanceIX = SystemProgram.nonceAdvance({
            authorizedPubkey: nonceAuthKP.publicKey,
            noncePubkey: nonceKeypair.publicKey
        })

        transaction.add(advanceIX)
        blockhash = nonceAccount.nonce
    }

    transaction.add(transferInstruction)

    transaction.recentBlockhash = blockhash
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

        const sendAfterTime = USE_NONCE ? 123000 : 0
        setTimeout(async () => {
            const signature = await connection.sendRawTransaction(serializedTransaction)

            console.log('TRANSACTION SEND AFTER TIME: ', sendAfterTime / 1000 + 's')
            console.log('SENDER: ', sender.publicKey.toBase58())
            console.log('RECIPIENT: ', recipient.publicKey.toBase58())
            console.log('Transaction signature:', signature)
        }, sendAfterTime)
    } catch (error) {
        console.error('Error:', error)
    }
}

main().catch(err => {
    console.error('Error:', err)
})
