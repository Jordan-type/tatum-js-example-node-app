import { Injectable } from '@nestjs/common'
import { TatumEthSDK } from '@tatumio/eth'

@Injectable()
export class EthService {
  private getSdk() {
    return TatumEthSDK({ apiKey: process.env.API_KEY || 'api-key' })
  }

  public generateWallet(xpub: string, index: number): string {
    return this.getSdk().wallet.generateAddressFromXPub(xpub, index)
  }
}
