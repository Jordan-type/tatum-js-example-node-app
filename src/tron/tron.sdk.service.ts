import { TatumTronSDK } from '@tatumio/tron'
import { Injectable } from '@nestjs/common'

@Injectable()
export class TronSdkService {
  public getSdk() {
    return TatumTronSDK({ apiKey: process.env.API_KEY || 'api-key' })
  }
}
