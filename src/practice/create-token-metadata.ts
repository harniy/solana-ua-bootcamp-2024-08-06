import "dotenv/config"
import {
  Connection, clusterApiUrl, Keypair, PublicKey, sendAndConfirmTransaction, Transaction,
  Cluster,
} from "@solana/web3.js"
// Yes, createCreate! We're making an instruction for createMetadataV3...
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata"
import { secretToUint8Array } from "../utils"

const cluster = process.env.CONNECTION_CLUSTER as Cluster
const secretKey = secretToUint8Array(process.env.SECRET_KEY)
const keypair = Keypair.fromSecretKey(secretKey)

const connection = new Connection(clusterApiUrl(cluster), 'confirmed')


const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
)

const tokenMintAccount = new PublicKey(
  "2f1vZ5bStRY5UzhEu8PokJ8qTbYjNHB9sdGYemGvX3N2"
)

const metadataData = {
  name: "Some Test Token",
  symbol: "STT",
  uri: "https://akrd.net/Cf3dTxx7g-U-iJzMwFIV7QqDYsNr634nz-GPyk6arbc",
  sellerFeeBasisPoints: 0,
  creators: null,
  collection: null,
  uses: null,
}

const [metadataPDA, _metadataBump] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("metadata"),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    tokenMintAccount.toBuffer(),
  ],
  TOKEN_METADATA_PROGRAM_ID
)

const transaction = new Transaction()
const createMetadataAccountInstruction =
createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: tokenMintAccount,
      mintAuthority: keypair.publicKey,
      payer: keypair.publicKey,
      updateAuthority: keypair.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        collectionDetails: null,
        data: metadataData,
        isMutable: true,
      },
    }
  )
transaction.add(createMetadataAccountInstruction)

const signature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [keypair]
)


console.log(`Metadata updated! Tx signature: ${signature}`)

