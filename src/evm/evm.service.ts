import { Logger } from '@nestjs/common'
import { WalletStoreService } from '../common/services/wallet.store.service'
import { Chain } from '../common/dto/chain.enum'
import { GeneratedWalletAddressKeyDto, GeneratedWalletDto } from '../common/dto/generated.wallet.dto'
import { EvmSdkService } from './evm.sdk.service'
import BigNumber from 'bignumber.js'
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception'

export abstract class EvmService {
  protected constructor(
    readonly chain: Chain,
    readonly sdkService: EvmSdkService,
    readonly walletStoreService: WalletStoreService,
  ) {}

  public async generateWallet(customMnemonic?: string) {
    const existing = await this.walletStoreService.read(this.chain)
    if (existing !== null) {
      Logger.log(`Existing wallet: ${JSON.stringify(existing)}`)
      return existing
    }

    this.sdkService.getSdk()

    const sdk = this.sdkService.getSdk()

    const { mnemonic, xpub } = await sdk.wallet.generateWallet(customMnemonic)

    const wallet: GeneratedWalletDto = {
      mnemonic,
      xpub,
      addresses: await Promise.all(
        [0, 1, 2, 3, 4].map(async (index) => this.generateAddressAndKey(mnemonic, xpub, index)),
      ),
    }

    await this.walletStoreService.write(this.chain, wallet)
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
    const { addresses } = await this.walletStoreService.readOrThrow(this.chain)
    return this.transferNative(addresses[0], addresses[1], '0.15')
  }

  public async transferNative(
    fromAddress: GeneratedWalletAddressKeyDto,
    toAddress: GeneratedWalletAddressKeyDto,
    amount: string,
  ) {
    const sdk = this.sdkService.getSdk()

    const { gasPrice, gasLimit, fee } = await this.estimateFee(fromAddress.address, amount, toAddress.address)

    await this.checkNativeBalanceOrThrow(fromAddress.address, amount, fee)

    const result = await sdk.transaction.send.transferSignedTransaction({
      to: toAddress.address,
      amount: amount,
      fromPrivateKey: fromAddress.privateKey,
      fee: {
        gasLimit: gasLimit.toFixed(),
        gasPrice: gasPrice.toFixed(),
      },
    })
    Logger.log(
      `Transfer: ${fromAddress.address} -> ${
        toAddress.address
      }: Value: ${amount}, Fee: ${fee.toFixed()}. TxId: ${result.txId}`,
    )
    return result
  }

  public async checkNativeBalanceOrThrow(address: string, amount: string, fee: BigNumber) {
    const { balance } = await this.sdkService.getSdk().blockchain.getBlockchainAccountBalance(address)
    if (new BigNumber(balance || '0').lt(new BigNumber(amount).plus(fee))) {
      throw new BadRequestException({
        msg: `Native balance [${
          balance || '0'
        }] of an address is less than amount [${amount}] + fees [${fee.toFixed()}]`,
      })
    }
  }

  public abstract estimateFee(
    from: string,
    amount: string,
    to: string,
    contractAddress?: string,
  ): Promise<{
    gasLimit: BigNumber
    gasPrice: BigNumber
    fee: BigNumber
  }>

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
    return this.sdkService.getSdk().blockchain.get(hash)
  }

  public async getAddressBalance(address: string) {
    return this.sdkService.getSdk().blockchain.getBlockchainAccountBalance(address)
  }
}
