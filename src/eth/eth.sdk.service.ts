import { Injectable } from '@nestjs/common'
import { TatumEthSDK } from '@tatumio/eth'

@Injectable()
export class EthSdkService {
  public getSdk() {
    return TatumEthSDK({ apiKey: process.env.API_KEY || 'api-key' })
  }
}
