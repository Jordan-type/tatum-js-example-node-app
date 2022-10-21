import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { WalletStoreService } from '../common/services/wallet.store.service'
import { TronSdkService } from './tron.sdk.service'
import { GeneratedWalletAddressKeyDto, GeneratedWalletDto } from '../common/dto/generated.wallet.dto'
import { Chain } from '../common/dto/chain.enum'
import BigNumber from 'bignumber.js'

@Injectable()
export class TronService {
  constructor(readonly sdkService: TronSdkService, readonly walletStoreService: WalletStoreService) {}

  public async generateWallet(customMnemonic?: string) {
    const existing = await this.walletStoreService.read(Chain.TRON)
    if (existing !== null) {
      Logger.log(`Existing wallet: ${JSON.stringify(existing)}`)
      return existing
    }

    const sdk = this.sdkService.getSdk()

    const { mnemonic, xpub } = await sdk.wallet.generateWallet(customMnemonic)

    const wallet: GeneratedWalletDto = {
      mnemonic,
      xpub,
      addresses: await Promise.all(
        [0, 1, 2, 3, 4].map(async (index) => this.generateAddressAndKey(mnemonic, xpub, index)),
      ),
    }

    await this.walletStoreService.write(Chain.TRON, wallet)
    Logger.log(`Generated wallet: ${JSON.stringify(wallet)}`)
    return wallet
  }

  private async generateAddressAndKey(mnemonic: string, xpub: string, index: number) {
    const sdk = this.sdkService.getSdk()

    const address = sdk.wallet.generateAddressFromXPub(xpub, index)
    const privateKey = await sdk.wallet.generatePrivateKeyFromMnemonic(mnemonic, index)

    return {
      index,
      address,
      privateKey,
    }
  }

  public async transferNativeFromExistingWallet() {
    const { addresses } = await this.walletStoreService.readOrThrow(Chain.TRON)
    return this.transferNative(addresses[0], addresses[1], '100')
  }

  public async transferNative(
    fromAddress: GeneratedWalletAddressKeyDto,
    toAddress: GeneratedWalletAddressKeyDto,
    amount: string,
  ) {
    const sdk = this.sdkService.getSdk()

    await this.checkNativeBalanceOrThrow(fromAddress.address, amount)

    const result = await sdk.transaction.send.signedTransaction({
      to: toAddress.address,
      amount: amount,
      fromPrivateKey: fromAddress.privateKey,
    })
    Logger.log(
      `Transfer: ${fromAddress.address} -> ${toAddress.address}: Value: ${amount}. TxId: ${result.txId}`,
    )
    return result
  }

  public async checkNativeBalanceOrThrow(address: string, amount: string) {
    const { balance } = await this.getAddressBalance(address)
    if (new BigNumber(balance).lt(new BigNumber(amount))) {
      throw new BadRequestException({
        msg: `Native balance [${balance}] of an address is less than operation amount [${amount}]`,
      })
    }
  }

  public async generatePrivateKey(mnemonic: string, index: number) {
    return this.sdkService.getSdk().wallet.generatePrivateKeyFromMnemonic(mnemonic, index)
  }

  public generateAddress(xpub: string, index: number): string {
    return this.sdkService.getSdk().wallet.generateAddressFromXPub(xpub, index)
  }

  public async getCurrentBlock() {
    return this.sdkService.getSdk().blockchain.getCurrentBlock()
  }

  public async getBlock(hashOrNumber: string) {
    return this.sdkService.getSdk().blockchain.getBlock(hashOrNumber)
  }

  public async getTransaction(hash: string) {
    return this.sdkService.getSdk().blockchain.getTransaction(hash)
  }

  public async getAddressBalance(address: string) {
    try {
      const account = await this.sdkService.getSdk().blockchain.getAccount(address)
      return {
        balance: new BigNumber(account.balance).dividedBy(new BigNumber(10).pow(6)).toFixed(),
      }
    } catch (e) {
      return {
        balance: '0',
      }
    }
  }
}
