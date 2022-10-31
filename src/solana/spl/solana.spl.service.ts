import { Chain } from '../../common/dto/chain.enum'
import { WalletStoreService } from '../../common/services/wallet.store.service'
import { ContractStoreService } from '../../common/services/contract.store.service'
import { SolanaSdkService } from '../solana.sdk.service'
import { SolanaService } from '../solana.service'
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { Contract } from '../../common/dto/contract.enum'
import { GeneratedContractWithAddress } from '../../common/dto/generated.contract.dto'
import { TransactionHash } from '@tatumio/api-client'
import BigNumber from 'bignumber.js'
import { CONTRACT_CONSTANTS } from '../../evm/erc20/evm.erc20.service'

export const SPL_CONSTANTS = {
  supply: '1000',
  digits: 2,
}

@Injectable()
export class SolanaSplService {
  constructor(
    readonly sdkService: SolanaSdkService,
    readonly solanaService: SolanaService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {}

  public async createSplToken() {
    const existingToken = await this.contractStoreService.read(Chain.SOL, Contract.SPL)
    if (existingToken !== null) {
      return existingToken
    }

    const existing = await this.walletStoreService.readOrThrow(Chain.SOL)
    const wallet = existing.addresses[0]

    const result = (await this.sdkService.getSdk().transaction.createSplToken({
      ...SPL_CONSTANTS,
      chain: Chain.SOL,
      address: wallet.address,
      from: wallet.address,
      fromPrivateKey: wallet.privateKey,
    })) as { txId: string; contractAddress: string }
    await this.contractStoreService.write(Chain.SOL, Contract.SPL, {
      ...result,
      creator: wallet.address,
    })
    Logger.log(`SPL token created. Address: ${result.contractAddress}. TxId: ${result.txId}`)
    return result
  }

  public async transferSpl() {
    const { contractAddress } = await this.readContractAddressOrThrow()

    const existingWallet = await this.walletStoreService.readOrThrow(Chain.SOL)
    const from = existingWallet.addresses[0]
    const to = existingWallet.addresses[1]
    const amount = '100'

    // Node issues
    // await this.checkSplBalanceOrThrow(from.address, contractAddress, amount)

    const result = (await this.sdkService.getSdk().transaction.transferSplToken({
      chain: Chain.SOL,
      to: to.address,
      amount,
      contractAddress,
      digits: SPL_CONSTANTS.digits,
      from: from.address,
      fromPrivateKey: from.privateKey,
    })) as TransactionHash
    Logger.log(`Transfer: ${from.address} -> ${to.address}: Value [SPL]: ${amount}. TxId: ${result.txId}`)
    return result
  }

  private async checkSplBalanceOrThrow(address: string, contractAddress: string, amount: string) {
    const arr = await this.sdkService.getSdk().spl.getSplAccountBalances(Chain.SOL, address)
    const balanceItem = arr.find((item) => item.contractAddress === contractAddress)
    const balance = balanceItem?.balance
    const balanceFixed = new BigNumber(balance || '0').dividedBy(
      new BigNumber(10).pow(CONTRACT_CONSTANTS.digits),
    )
    if (balanceFixed.lt(new BigNumber(amount))) {
      throw new BadRequestException({
        msg: `SPL [${contractAddress}] Balance [${balanceFixed.toFixed()}] of an address is less than amount [${amount}]]`,
      })
    }
  }

  private async readContractAddressOrThrow(): Promise<GeneratedContractWithAddress> {
    const existingContract = await this.contractStoreService.readOrThrow(Chain.SOL, Contract.SPL)

    if (this.contractStoreService.isContractWithAddress(existingContract)) {
      return existingContract
    }

    throw new InternalServerErrorException('Something went wrong')
  }
}
