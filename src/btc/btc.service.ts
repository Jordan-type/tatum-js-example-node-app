import { Injectable, NotImplementedException } from '@nestjs/common'
import { TatumBtcSDK } from '@tatumio/btc'
import { GeneratedWalletDto } from '../common/dto/generated.wallet.dto'

@Injectable()
export class BtcService {
  private getSdk() {
    return TatumBtcSDK({ apiKey: process.env.API_KEY || 'api-key' })
  }

  private readonly _options = { testnet: true }

  public async generateWallet(mnemonic?: string) {
    return this.getSdk().wallet.generateWallet(mnemonic, this._options)
  }

  public async generateWalletAndAddresses(customMnemonic?: string) {
    let generatedWalletDto = new GeneratedWalletDto()
    const { mnemonic, xpub } = await this.generateWallet(customMnemonic)
    generatedWalletDto.mnemonic = mnemonic
    generatedWalletDto.xpub = xpub
    generatedWalletDto.addresses = []
    for (let i = 0; i < 5; i++) {
      generatedWalletDto.addresses.push({
        address: this.generateAddress(xpub, i),
        privateKey: await this.generatePrivateKey(xpub, i),
        index: i,
      })
    }
    return generatedWalletDto
  }

  public async generatePrivateKey(mnemonic: string, index: number) {
    return this.getSdk().wallet.generatePrivateKeyFromMnemonic(mnemonic, index)
  }

  public generateAddress(xpub: string, index: number): string {
    return this.getSdk().wallet.generateAddressFromXPub(xpub, index, this._options)
  }

  public async getCurrentBlock() {
    throw new NotImplementedException() //TODO
  }

  public async getBlock(hashOrNumber: string) {
    return this.getSdk().blockchain.getBlock(hashOrNumber)
  }

  public async getTransaction(hash: string) {
    return this.getSdk().blockchain.getTransaction(hash)
  }

  public async getAddressBalance(address: string) {
    return this.getSdk().blockchain.getBlockchainAccountBalance(address)
  }
}
