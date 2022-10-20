import { Injectable, Logger, NotImplementedException } from '@nestjs/common'
import { TatumBtcSDK } from '@tatumio/btc'
import { GeneratedWalletDto } from '../common/dto/generated.wallet.dto'
import { WalletStoreService } from '../common/services/wallet.store.service'
import { Chain } from '../common/dto/chain.enum'

@Injectable()
export class BtcService {
  constructor(readonly walletStoreService: WalletStoreService) {}

  private getSdk() {
    return TatumBtcSDK({ apiKey: process.env.API_KEY || 'api-key' })
  }

  private readonly _options = { testnet: true }

  public async generateWallet(mnemonic?: string) {
    return this.getSdk().wallet.generateWallet(mnemonic, this._options)
  }

  public async generateWalletAndAddresses(customMnemonic?: string) {
    const existing = await this.walletStoreService.read(Chain.BTC)
    if (existing !== null) {
      Logger.log(`Existing wallet: ${JSON.stringify(existing)}`)
      return existing
    }

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
    await this.walletStoreService.write(Chain.BTC, generatedWalletDto)
    Logger.log(`Generated wallet: ${JSON.stringify(generatedWalletDto)}`)
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

  public async transfer() {
    const existing = await this.walletStoreService.readOrThrow(Chain.BTC)
    const address0 = existing.addresses[0]
    const address1 = existing.addresses[1]

    const value = 0.000001
    const transactionHash = await this.getSdk().transaction.sendTransaction(
      {
        fromAddress: [
          {
            address: address0.address,
            privateKey: address0.privateKey,
          },
        ],
        to: [
          {
            address: address1.address,
            value,
          },
        ],
        fee: value.toFixed(),
        changeAddress: address0.address,
      },
      this._options,
    )
    Logger.log(
      `Transfer: ${address0.address} -> ${address1.address}: ${value}. Tx id: ${transactionHash.txId}`,
    )
  }
}
