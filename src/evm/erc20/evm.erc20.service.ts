import { BadRequestException, Logger } from '@nestjs/common'
import { WalletStoreService } from '../../common/services/wallet.store.service'
import { ContractStoreService } from '../../common/services/contract.store.service'
import { EvmChain } from '../../common/dto/chain.enum'
import { Contract } from '../../common/dto/contract.enum'
import { GeneratedContract, GeneratedContractWithAddress } from '../../common/dto/generated.contract.dto'
import { TransactionHash } from '@tatumio/api-client'
import BigNumber from 'bignumber.js'
import { EvmSdkService } from '../evm.sdk.service'
import { EvmService } from '../evm.service'

export const CONTRACT_CONSTANTS = {
  symbol: 'EXMPL',
  name: 'Example Contract',
  totalCap: '1000000',
  digits: 2,
}

export abstract class EvmErc20Service {
  protected constructor(
    readonly chain: EvmChain,
    readonly sdkService: EvmSdkService,
    readonly ethService: EvmService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {}

  public async deployContract() {
    const existingContract = await this.contractStoreService.read(this.chain, Contract.ERC20)
    if (existingContract !== null) {
      return existingContract
    }

    const existing = await this.walletStoreService.readOrThrow(this.chain)
    const wallet = existing.addresses[0]

    const result: GeneratedContract = (await this.sdkService.getSdk().erc20.send.deploySignedTransaction({
      ...CONTRACT_CONSTANTS,
      supply: '1000',
      address: wallet.address,
      fromPrivateKey: wallet.privateKey,
    })) as TransactionHash
    await this.contractStoreService.write(this.chain, Contract.ERC20, result)
    Logger.log(`ERC20 SC deployed. TxId: ${result.txId}`)
    return result
  }

  public async transferErc20() {
    const { contractAddress } = await this.readContractAddressOrThrow()

    const existingWallet = await this.walletStoreService.readOrThrow(this.chain)
    const from = existingWallet.addresses[0]
    const to = existingWallet.addresses[1]
    const amount = '100'

    await this.checkErc20BalanceOrThrow(from.address, contractAddress, amount)

    const { gasPrice, gasLimit, fee } = await this.ethService.estimateFee(
      from.address,
      amount,
      to.address,
      contractAddress,
    )

    await this.ethService.checkNativeBalanceOrThrow(from.address, '0', fee)

    const result = (await this.sdkService.getSdk().erc20.send.transferSignedTransaction({
      chain: this.chain,
      to: to.address,
      amount,
      contractAddress,
      digits: CONTRACT_CONSTANTS.digits,
      fromPrivateKey: from.privateKey,
      fee: {
        gasLimit: gasLimit.toFixed(),
        gasPrice: gasPrice.toFixed(),
      },
    })) as TransactionHash
    Logger.log(
      `Transfer: ${from.address} -> ${to.address}: Value [ERC20]: ${amount}, Fee: ${fee.toFixed()}. TxId: ${
        result.txId
      }`,
    )
    return result
  }

  public async mintErc20() {
    const { contractAddress } = await this.readContractAddressOrThrow()
    const existingWallet = await this.walletStoreService.readOrThrow(this.chain)
    const address = existingWallet.addresses[0]

    const result = (await this.sdkService.getSdk().erc20.send.mintSignedTransaction({
      chain: this.chain,
      amount: '1000',
      to: address.address,
      contractAddress,
      fromPrivateKey: address.privateKey,
    })) as TransactionHash
    Logger.log(`Mint: [ERC20] 1000 Tokens to -> ${address.address}. TxId: ${result.txId}`)

    return result
  }

  public async burnErc20() {
    const { contractAddress } = await this.readContractAddressOrThrow()
    const existingWallet = await this.walletStoreService.readOrThrow(this.chain)
    const address = existingWallet.addresses[0]

    const result = (await this.sdkService.getSdk().erc20.send.burnSignedTransaction({
      chain: this.chain,
      amount: '100',
      contractAddress,
      fromPrivateKey: address.privateKey,
    })) as TransactionHash
    Logger.log(`Burn: [ERC20] 100 Tokens on contract ${contractAddress}. TxId: ${result.txId}`)

    return result
  }

  private async checkErc20BalanceOrThrow(address: string, contractAddress: string, amount: string) {
    const { balance } = await this.sdkService
      .getSdk()
      .erc20.getErc20AccountBalance(this.chain, address, contractAddress)
    const balanceFixed = new BigNumber(balance || '0').dividedBy(
      new BigNumber(10).pow(CONTRACT_CONSTANTS.digits),
    )
    if (balanceFixed.lt(new BigNumber(amount))) {
      throw new BadRequestException({
        msg: `ERC20 [${contractAddress}] Balance [${balanceFixed.toFixed()}] of an address is less than amount [${amount}]]`,
      })
    }
  }

  private async readContractAddressOrThrow(): Promise<GeneratedContractWithAddress> {
    const existingContract = await this.contractStoreService.readOrThrow(this.chain, Contract.ERC20)

    if (existingContract.contractAddress) {
      return existingContract as GeneratedContractWithAddress
    }

    try {
      const transaction = await this.ethService.getTransaction(existingContract.txId)

      const contract = {
        ...existingContract,
        contractAddress: transaction.contractAddress,
      }

      await this.contractStoreService.write(this.chain, Contract.ERC20, contract)
      Logger.log(`Detected erc20 contract address: ${contract.contractAddress}`)

      return contract as GeneratedContractWithAddress
    } catch (e) {
      throw new BadRequestException(
        `Could not find contract address by txId [${existingContract.txId}]. 
        The transaction may not have been completed yet.
         You can check the status of the transaction here: https://sepolia.etherscan.io/tx/${existingContract.txId}`,
      )
    }
  }
}
