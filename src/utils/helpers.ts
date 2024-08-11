import { PublicKey } from "@solana/web3.js"
import bs58 from 'bs58'

export function log(pubkey: PublicKey, pubkeyType: string) {
    console.log(`User ${pubkeyType}: ${pubkey.toBase58()}`)
}

export function timeElapsed (pastDate: Date): string {
    const now = new Date()
    const diffInMilliseconds = now.getTime() - pastDate.getTime()
    
    const seconds = Math.floor(diffInMilliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    let result = ''
  
    if (days > 0) {
      result += `${days} day${days > 1 ? 's' : ''} `
    }
    if (hours % 24 > 0) {
      result += `${hours % 24} hour${(hours % 24) > 1 ? 's' : ''} `
    }
    if (minutes % 60 > 0) {
      result += `${minutes % 60} minute${(minutes % 60) > 1 ? 's' : ''} `
    }
    if (seconds % 60 > 0) {
      result += `${seconds % 60} second${(seconds % 60) > 1 ? 's' : ''}`
    }
  
    return result.trim() || '0 seconds'
  }

  export function formatNumber (num: number, digits = 0, maxDigits = 0): string  {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: digits,
      maximumFractionDigits: maxDigits,
    })
    
    return formatter.format(num)
  }

 export function secretToUint8Array(secretKey: string): Uint8Array {
    return secretKey.startsWith('[') ?
     Uint8Array.from(JSON.parse(secretKey))
     : bs58.decode(secretKey)
}