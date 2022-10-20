import { Injectable } from '@nestjs/common'
import { TatumEthSDK } from '@tatumio/eth'
import { EvmSdkService } from '../evm/evm.sdk.service'

@Injectable()
export class EthSdkService extends EvmSdkService {
  getSdk() {
    return TatumEthSDK({ apiKey: process.env.API_KEY || 'api-key' })
  }
}
