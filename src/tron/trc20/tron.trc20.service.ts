import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { WalletStoreService } from '../../common/services/wallet.store.service'
import { ContractStoreService } from '../../common/services/contract.store.service'
import { Chain } from '../../common/dto/chain.enum'
import { Contract } from '../../common/dto/contract.enum'
import { GeneratedContractWithAddress } from '../../common/dto/generated.contract.dto'
import { TronSdkService } from '../tron.sdk.service'
import { TronService } from '../tron.service'
import BigNumber from 'bignumber.js'

export const TRC20_CONTRACT_CONSTANTS = {
  symbol: 'EXMPL',
  name: 'ExampleContract',
  totalSupply: 1000000,
  decimals: 2,
}

@Injectable()
export class TronTrc20Service {
  constructor(
    readonly sdkService: TronSdkService,
    readonly tronService: TronService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {}

  public async deployContract() {
    Logger.warn(
      this.sdkService
        .getSdk()
        .tronWeb.getClient()
        .address.fromHex('e72c443971ea1bfe8a45477c80f59026a5662f8f'),
    )
    const existingContract = await this.contractStoreService.read(Chain.TRON, Contract.TRC20)
    if (existingContract !== null) {
      return existingContract
    }

    const existing = await this.walletStoreService.readOrThrow(Chain.TRON)
    const wallet = existing.addresses[0]

    const result = await this.sdkService.getSdk().trc20.send.createSignedTransaction({
      ...TRC20_CONTRACT_CONSTANTS,
      recipient: wallet.address,
      fromPrivateKey: wallet.privateKey,
    })
    await this.contractStoreService.write(Chain.TRON, Contract.TRC20, {
      ...result,
      creator: wallet.address,
    })
    Logger.log(`TRC20 SC deployed. TxId: ${result.txId}`)
    return result
  }

  public async transferTrc20() {
    const { contractAddress } = await this.readContractAddressOrThrow()

    const existingWallet = await this.walletStoreService.readOrThrow(Chain.TRON)
    const from = existingWallet.addresses[0]
    const to = existingWallet.addresses[1]
    const amount = '100'

    await this.checkTrc20BalanceOrThrow(from.address, contractAddress, amount)

    const result = await this.sdkService.getSdk().trc20.send.signedTransaction({
      to: to.address,
      amount,
      tokenAddress: contractAddress,
      fromPrivateKey: from.privateKey,
      feeLimit: 10,
    })
    Logger.log(`Transfer: ${from.address} -> ${to.address}: Value [TRC20]: ${amount}. TxId: ${result.txId}`)
    return result
  }

  private async checkTrc20BalanceOrThrow(address: string, contractAddress: string, amount: string) {
    const { trc20 } = await this.sdkService.getSdk().blockchain.getAccount(address)

    const balance = trc20.find((item) => item[contractAddress] !== undefined)[contractAddress]

    const balanceFixed = new BigNumber(balance || 0).dividedBy(
      new BigNumber(10).pow(TRC20_CONTRACT_CONSTANTS.decimals),
    )
    if (balanceFixed.lt(new BigNumber(amount))) {
      throw new BadRequestException({
        msg: `TRC20 [${contractAddress}] Balance [${balanceFixed.toFixed()}] of an address is less than operation amount [${amount}]`,
      })
    }
  }

  private async readContractAddressOrThrow(): Promise<GeneratedContractWithAddress> {
    const existingContract = await this.contractStoreService.readOrThrow(Chain.TRON, Contract.TRC20)

    if (this.contractStoreService.isContractWithAddress(existingContract)) {
      return existingContract
    }

    try {
      const { contractAddress } = await this.sdkService
        .getSdk()
        .blockchain.smartContractGetAddress(Chain.TRON, existingContract.txId)

      if (!contractAddress) {
        throw new BadRequestException('Could not find contract address')
      }

      const contract: GeneratedContractWithAddress = {
        ...existingContract,
        contractAddress,
      }

      await this.contractStoreService.write(Chain.TRON, Contract.TRC20, contract)
      Logger.log(`Detected trc20 contract address: ${contract.contractAddress}`)

      return contract
    } catch (e) {
      Logger.error(e)
      throw new BadRequestException(
        `Could not find contract address by txId [${existingContract.txId}].
        The transaction may not have been completed yet.
         You can check the status of the transaction here: https://shasta.tronscan.org/#/transaction/${existingContract.txId}`,
      )
    }
  }
}
