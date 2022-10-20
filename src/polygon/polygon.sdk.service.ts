import { Injectable } from '@nestjs/common'
import { EvmSdkService } from '../evm/evm.sdk.service'
import { TatumPolygonSDK } from '@tatumio/polygon'

@Injectable()
export class PolygonSdkService extends EvmSdkService {
  getSdk() {
    return TatumPolygonSDK({ apiKey: process.env.API_KEY || 'api-key' })
  }
}
