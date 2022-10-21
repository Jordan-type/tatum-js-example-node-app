import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { WalletStoreService } from '../../common/services/wallet.store.service'
import { ContractStoreService } from '../../common/services/contract.store.service'
import { Chain } from '../../common/dto/chain.enum'
import { Contract } from '../../common/dto/contract.enum'
import { GeneratedContractWithTokenId } from '../../common/dto/generated.contract.dto'
import { TronSdkService } from '../tron.sdk.service'
import { TronService } from '../tron.service'
import BigNumber from 'bignumber.js'

export const TRC10_CONTRACT_CONSTANTS = {
  abbreviation: 'EXMPL',
  name: 'ExampleContract',
  description: 'Example TRC10 Contract created by Tatum SDK',
  url: 'https://tatum.io',
  totalSupply: 1000000,
  decimals: 2,
}

@Injectable()
export class TronTrc10Service {
  constructor(
    readonly sdkService: TronSdkService,
    readonly tronService: TronService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {}

  public async deployContract() {
    const existingContract = await this.contractStoreService.read(Chain.TRON, Contract.TRC10)
    if (existingContract !== null) {
      return existingContract
    }

    const existing = await this.walletStoreService.readOrThrow(Chain.TRON)
    const wallet = existing.addresses[0]

    const result = await this.sdkService.getSdk().trc10.send.createSignedTransaction({
      ...TRC10_CONTRACT_CONSTANTS,
      recipient: wallet.address,
      fromPrivateKey: wallet.privateKey,
    })
    await this.contractStoreService.write(Chain.TRON, Contract.TRC10, {
      ...result,
      creator: wallet.address,
    })
    Logger.log(`TRC10 SC deployed. TxId: ${result.txId}`)
    return result
  }

  public async transferTrc10() {
    const { tokenId } = await this.readContractAddressOrThrow()

    const existingWallet = await this.walletStoreService.readOrThrow(Chain.TRON)
    const from = existingWallet.addresses[0]
    const to = existingWallet.addresses[1]
    const amount = '100'

    await this.checkTrc10BalanceOrThrow(from.address, tokenId, amount)

    const result = await this.sdkService.getSdk().trc10.send.signedTransaction({
      to: to.address,
      amount,
      tokenId,
      fromPrivateKey: from.privateKey,
    })
    Logger.log(`Transfer: ${from.address} -> ${to.address}: Value [TRC10]: ${amount}. TxId: ${result.txId}`)
    return result
  }

  private async checkTrc10BalanceOrThrow(address: string, tokenId: string, amount: string) {
    const { trc10 } = await this.sdkService.getSdk().blockchain.getAccount(address)

    const balance = trc10.find((item) => item.key === tokenId)

    const balanceFixed = new BigNumber(balance?.value || 0).dividedBy(
      new BigNumber(10).pow(TRC10_CONTRACT_CONSTANTS.decimals),
    )
    if (balanceFixed.lt(new BigNumber(amount))) {
      throw new BadRequestException({
        msg: `TRC10 [${tokenId}] Balance [${balanceFixed.toFixed()}] of an address is less than operation amount [${amount}]`,
      })
    }
  }

  private async readContractAddressOrThrow(): Promise<GeneratedContractWithTokenId> {
    const existingContract = await this.contractStoreService.readOrThrow(Chain.TRON, Contract.TRC10)

    if (this.contractStoreService.isContractWithTokenId(existingContract)) {
      return existingContract
    }

    try {
      // @TODO - sdk/openapi bug
      const details: any = await this.sdkService
        .getSdk()
        .blockchain.getTrc10Detail(existingContract.creator as any)

      const contract: GeneratedContractWithTokenId = {
        ...existingContract,
        tokenId: details.id.toString(),
      }

      await this.contractStoreService.write(Chain.TRON, Contract.TRC10, contract)
      Logger.log(`Detected trc10 contract id: ${contract.tokenId}`)

      return contract
    } catch (e) {
      throw new BadRequestException(
        `Could not find contract address by txId [${existingContract.txId}].
        The transaction may not have been completed yet.
         You can check the status of the transaction here: https://shasta.tronscan.org/#/transaction/${existingContract.txId}`,
      )
    }
  }
}
