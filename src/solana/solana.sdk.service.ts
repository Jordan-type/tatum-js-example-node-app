import { Injectable } from '@nestjs/common'
import { TatumSolanaSDK } from '@tatumio/solana'

@Injectable()
export class SolanaSdkService {
  getSdk() {
    return TatumSolanaSDK({ apiKey: process.env.API_KEY || 'api-key' })
  }
}
