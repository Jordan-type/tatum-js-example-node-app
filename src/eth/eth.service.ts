import { Injectable } from '@nestjs/common'
import { TatumEthSDK } from '@tatumio/eth'

@Injectable()
export class EthService {
  private getSdk() {
    return TatumEthSDK({ apiKey: process.env.API_KEY || 'api-key' })
  }

  public async generateWallet(mnemonic?: string) {
    return this.getSdk().wallet.generateWallet(mnemonic)
  }

  public async generatePrivateKey(mnemonic: string, index: number) {
    return this.getSdk().wallet.generatePrivateKeyFromMnemonic(mnemonic, index)
  }

  public generateAddress(xpub: string, index: number): string {
    return this.getSdk().wallet.generateAddressFromXPub(xpub, index)
  }

  public async getCurrentBlock() {
    return this.getSdk().blockchain.getCurrentBlock()
  }

  public async getBlock(hashOrNumber: string) {
    return this.getSdk().blockchain.getBlock(hashOrNumber)
  }

  public async getTransaction(hash: string) {
    return this.getSdk().blockchain.get(hash)
  }

  public async getAddressBalance(address: string) {
    return this.getSdk().blockchain.getBlockchainAccountBalance(address)
  }
}
