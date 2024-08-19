import "dotenv/config"
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction,
    Cluster,
    PublicKeyInitData,
    clusterApiUrl,
    PublicKey,
    TransactionInstruction,
  } from '@solana/web3.js'
import { secretToUint8Array } from '../utils'


    const cluster = process.env.CONNECTION_CLUSTER as Cluster
    const secretKey = secretToUint8Array(process.env.SECRET_KEY)
  
  async function transferSol(recipient: PublicKeyInitData, amount: number, memoText?: string): Promise<void> {

    const connection = new Connection(clusterApiUrl(cluster), 'confirmed')
    const sender = Keypair.fromSecretKey(secretKey)
    const senderPreBalance = await connection.getBalance(sender.publicKey)
    const recipientPreBalance = await connection.getBalance(new PublicKey(recipient))
  
    console.log(`Before => Sender ${sender.publicKey.toBase58()}; Balance: ${senderPreBalance / LAMPORTS_PER_SOL}`)
    console.log(`Before => Recipient ${recipient}; Balance: ${recipientPreBalance / LAMPORTS_PER_SOL}`)
  
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: new PublicKey(recipient),
        lamports: amount * LAMPORTS_PER_SOL, 
      }),
    )

    if (memoText) {
        transaction.add(new TransactionInstruction({
            keys: [
              { pubkey: sender.publicKey, isSigner: true, isWritable: true },
            ],
            data: Buffer.from(memoText, "utf-8"),
            programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
          }))
    }
  
    const signature = await sendAndConfirmTransaction(connection, transaction, [sender])

    const senderPostBalance = await connection.getBalance(sender.publicKey)
    const recipientPostBalance = await connection.getBalance(new PublicKey(recipient))
  
    console.log(`After => Sender ${sender.publicKey.toBase58()}; Balance: ${senderPostBalance / LAMPORTS_PER_SOL}`)
    console.log(`After => Recipient ${recipient}; Balance: ${recipientPostBalance / LAMPORTS_PER_SOL}`)

    console.log('Tx Signature:', signature)
  }
  
  transferSol('9SwiEpL5AnkYC2SCYGvWVQ2VLhN55osuEprecAXUGuse', 2, 'Send sol in devnet with Memo').catch((error) => {
    console.error('Error:', error)
  })
  