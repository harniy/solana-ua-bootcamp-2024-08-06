import "dotenv/config"
import {
    Connection,
    Keypair,
    clusterApiUrl,
    Cluster,
  } from '@solana/web3.js'
  import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
  import "dotenv/config"
  import { secretToUint8Array } from '../utils'
  
  const cluster = process.env.CONNECTION_CLUSTER as Cluster
  const secretKey = secretToUint8Array(process.env.SECRET_KEY)
  
  async function createTokenMint(): Promise<void> {
    const connection = new Connection(clusterApiUrl(cluster), 'confirmed')
    const payer = Keypair.fromSecretKey(secretKey)
  
    const mint = await createMint(
      connection,
      payer,     
      payer.publicKey, 
      null,     
      9,       
    );
  
    console.log('Token mint:', mint.toBase58())
  
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey,
    )
  
    console.log('Associated token account:', tokenAccount.address.toBase58())
  
    const amount = 1000 
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      payer.publicKey,
      amount,
    )
  
    console.log(`Minting ${amount} tokens to ${tokenAccount.address.toBase58()}`)
  }
  
  createTokenMint().catch((error) => {
    console.error('Error:', error)
  })
  