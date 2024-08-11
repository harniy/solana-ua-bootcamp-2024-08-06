import { Keypair, PublicKeyInitData } from "@solana/web3.js"
import "dotenv/config"
import { formatNumber, timeElapsed } from "../utils"

const PREFIX: string = process.env.KEYPAIR_PREFIX ?? ''

function hasPrefix (publicKey: string, prefix: string): boolean {
  return publicKey.startsWith(prefix)
}

let count: number = 0
const startGenerate: Date = new Date()

function progress (): void {
    const timePassed = timeElapsed(startGenerate)
    const formattedNumber = formatNumber(count)
    console.log(`Keys generated: ${formattedNumber}; Time passed: ${timePassed}`)
}

async function generateKeypairWithPrefix (prefix: string): Promise<Keypair> {
  while (true) {
    count++

    const keypair: Keypair = Keypair.generate()
    const publicKeyBase58: PublicKeyInitData = keypair.publicKey.toBase58()

    if (count % 10000 === 0) {
        progress()
    }

    if (hasPrefix(String(publicKeyBase58), prefix)) {
      return keypair
    }
  }
}

async function main(): Promise<void> {
  try {
    const keypair = await generateKeypairWithPrefix(PREFIX)
    console.log(keypair)
    console.log(`User PublicKey: ${keypair.publicKey.toBase58()}`)
  } catch (error) {
    console.error(error)
  } finally {
    progress()
  }
}

main().catch(console.error)
