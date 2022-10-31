import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { WalletStoreService } from '../common/services/wallet.store.service'
import { Chain } from '../common/dto/chain.enum'
import { GeneratedWalletAddressKeyDto, GeneratedWalletDto } from '../common/dto/generated.wallet.dto'
import { SolanaSdkService } from './solana.sdk.service'
import { TransactionHash } from '@tatumio/api-client'
import BigNumber from 'bignumber.js'

@Injectable()
export class SolanaService {
  constructor(readonly sdkService: SolanaSdkService, readonly walletStoreService: WalletStoreService) {}

  public async generateWallet(customMnemonic?: string) {
    const existing = await this.walletStoreService.read(Chain.SOL)
    if (existing !== null) {
      Logger.log(`Existing wallet: ${JSON.stringify(existing)}`)
      return existing
    }

    const sdk = this.sdkService.getSdk()

    const mnemonic = customMnemonic ?? sdk.wallet.wallet().mnemonic

    if (!mnemonic) throw new InternalServerErrorException('Something went wrong')

    const wallet: GeneratedWalletDto = {
      mnemonic,
      addresses: [0, 1, 2, 3, 4].map((index) => this.generateAddressAndKey(mnemonic, index)),
    }

    await this.walletStoreService.write(Chain.SOL, wallet)
    Logger.log(`Generated wallet: ${JSON.stringify(wallet)}`)
    return wallet
  }

  public generateAddressAndKey(mnemonic: string, index: number) {
    const sdk = this.sdkService.getSdk()

    const { address, privateKey } = sdk.wallet.generateAddressFromMnemonic(mnemonic, index)

    return {
      index,
      address,
      privateKey,
    }
  }

  public async transferNativeFromExistingWallet() {
    const { addresses } = await this.walletStoreService.readOrThrow(Chain.SOL)
    return this.transferNative(addresses[0], addresses[1], '0.001')
  }

  public async transferNative(
    fromAddress: GeneratedWalletAddressKeyDto,
    toAddress: GeneratedWalletAddressKeyDto,
    amount: string,
  ) {
    const sdk = this.sdkService.getSdk()

    await this.checkNativeBalanceOrThrow(fromAddress.address, amount)

    const result = (await sdk.transaction.send({
      from: fromAddress.address,
      to: toAddress.address,
      amount: amount,
      fromPrivateKey: fromAddress.privateKey,
    })) as TransactionHash
    Logger.log(
      `Transfer: ${fromAddress.address} -> ${toAddress.address}: Value: ${amount}. TxId: ${result.txId}`,
    )
    return result
  }

  public async checkNativeBalanceOrThrow(address: string, amount: string) {
    const fee = new BigNumber('0.000005')

    const { balance } = await this.getAddressBalance(address)
    if (new BigNumber(balance || '0').lt(new BigNumber(amount).plus(fee))) {
      throw new BadRequestException({
        msg: `Native balance [${
          balance || '0'
        }] of an address is less than amount [${amount}] + fees [${fee.toFixed()}]`,
      })
    }
  }

  public async getCurrentBlock() {
    return this.sdkService.getSdk().blockchain.getCurrentBlock()
  }

  public async getBlock(number: number) {
    return this.sdkService.getSdk().blockchain.getBlock(number)
  }

  public async getTransaction(hash: string) {
    return this.sdkService.getSdk().blockchain.getTransaction(hash)
  }

  public async getAddressBalance(address: string) {
    return this.sdkService.getSdk().blockchain.getAccountBalance(address)
  }
}
