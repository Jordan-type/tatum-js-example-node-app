import { Injectable, Logger } from '@nestjs/common'
import { TatumEthSDK } from '@tatumio/eth'
import BigNumber from 'bignumber.js'
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception'
import { WalletStoreService } from '../common/services/wallet.store.service'
import { Chain } from '../common/dto/chain.enum'
import { GeneratedWalletAddressKeyDto, GeneratedWalletDto } from '../common/dto/generated.wallet.dto'

@Injectable()
export class EthService {
  constructor(readonly walletStoreService: WalletStoreService) {}

  private getSdk() {
    return TatumEthSDK({ apiKey: process.env.API_KEY || 'api-key' })
  }

  public async generateWallet(customMnemonic?: string) {
    const existing = await this.walletStoreService.read(Chain.ETH)
    if (existing !== null) {
      Logger.log(`Existing wallet: ${JSON.stringify(existing)}`)
      return existing
    }

    const sdk = this.getSdk()

    const { mnemonic, xpub } = await sdk.wallet.generateWallet(customMnemonic)

    const wallet: GeneratedWalletDto = {
      mnemonic,
      xpub,
      addresses: await Promise.all(
        [0, 1, 2, 3, 4].map(async (index) => this.generateAddressAndKey(mnemonic, xpub, index)),
      ),
    }

    await this.walletStoreService.write(Chain.ETH, wallet)
    Logger.log(`Generated wallet: ${JSON.stringify(wallet)}`)
    return wallet
  }

  private async generateAddressAndKey(mnemonic: string, xpub: string, index: number) {
    const sdk = this.getSdk()

    const address = sdk.wallet.generateAddressFromXPub(xpub, index)
    const privateKey = await sdk.wallet.generatePrivateKeyFromMnemonic(mnemonic, index)

    return {
      index,
      address,
      privateKey,
    }
  }

  public async transferNativeFromExistingWallet() {
    const { addresses } = await this.walletStoreService.readOrThrow(Chain.ETH)
    return this.transferNative(addresses[0], addresses[1], '0.00000001')
  }

  public async transferNative(
    fromAddress: GeneratedWalletAddressKeyDto,
    toAddress: GeneratedWalletAddressKeyDto,
    amount: string,
  ) {
    const sdk = this.getSdk()

    const { gasPrice, gasLimit, fee } = await this.estimateFee(fromAddress.address, amount, toAddress.address)

    await this.checkBalanceOrThrow(fromAddress.address, amount, fee)

    return sdk.transaction.send.transferSignedTransaction({
      to: toAddress.address,
      amount: amount,
      fromPrivateKey: fromAddress.privateKey,
      fee: {
        gasLimit: gasLimit.toFixed(),
        gasPrice: gasPrice.toFixed(),
      },
    })
  }

  public async transferErc20(fromPrivateKey: string) {
    const sdk = this.getSdk()

    const address = sdk.wallet.generateAddressFromPrivateKey(fromPrivateKey)

    const { txId } = await sdk.erc20.send.deploySignedTransaction({
      symbol: 'EXMPL',
      name: 'Example Contract',
      totalCap: '1000000',
      supply: '1000',
      digits: 2,
      address,
      fromPrivateKey,
    })

    sdk.blockchain.get(txId)
  }

  private async checkBalanceOrThrow(address: string, amount: string, fee: BigNumber) {
    const { balance } = await this.getSdk().blockchain.getBlockchainAccountBalance(address)
    if (new BigNumber(balance || '0').lt(new BigNumber(amount).plus(fee))) {
      throw new BadRequestException({
        msg: `Balance [${
          balance || '0'
        }] of an address is less than amount [${amount}] + fees [${fee.toFixed()}]`,
      })
    }
  }

  private async estimateFee(from: string, amount: string, to: string) {
    const sdk = this.getSdk()

    const estimateGas = await sdk.blockchain.estimateGas({
      amount,
      from,
      to,
    })

    const gasPrice = new BigNumber(estimateGas.estimations.standard).div(new BigNumber(10).pow(9))
    const gasLimit = new BigNumber(estimateGas.gasLimit)

    const fee = gasPrice.multipliedBy(gasLimit).div(new BigNumber(10).pow(8))

    return { gasPrice, gasLimit, fee }
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
