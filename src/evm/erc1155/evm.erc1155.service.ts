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

export abstract class EvmErc1155Service {
  protected constructor(
    readonly chain: EvmChain,
    readonly sdkService: EvmSdkService,
    readonly evmService: EvmService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {}

  public async deployContract() {
    const existingContract = await this.contractStoreService.read(this.chain, Contract.ERC1155)
    if (existingContract !== null) {
      return existingContract
    }

    const existing = await this.walletStoreService.readOrThrow(this.chain)
    const wallet = existing.addresses[0]

    const result: GeneratedContract = (await this.sdkService
      .getSdk()
      .multiToken.send.deployMultiTokenTransaction({
        chain: this.chain,
        uri: 'https://tatum.io',
        fromPrivateKey: wallet.privateKey,
      })) as TransactionHash
    await this.contractStoreService.write(this.chain, Contract.ERC1155, result)
    Logger.log(`ERC1155 SC deployed. TxId: ${result.txId}`)
    return result
  }

  public async mintErc1155() {
    const { contractAddress } = await this.readContractAddressOrThrow()
    const existingWallet = await this.walletStoreService.readOrThrow(this.chain)
    const address = existingWallet.addresses[0]

    const result = (await this.sdkService.getSdk().multiToken.send.mintMultiTokenTransaction({
      chain: this.chain,
      tokenId: '1337',
      amount: '1000',
      to: address.address,
      contractAddress,
      fromPrivateKey: address.privateKey,
    })) as TransactionHash
    Logger.log(`Mint: Token with id [1337] and amount [1000] successfully minted. TxId: ${result.txId}`)

    return result
  }

  public async transferErc1155() {
    const { contractAddress } = await this.readContractAddressOrThrow()

    const existingWallet = await this.walletStoreService.readOrThrow(this.chain)
    const from = existingWallet.addresses[0]
    const to = existingWallet.addresses[1]
    const tokenId = '1337'
    const amount = '100'

    await this.checkErc1155BalanceOrThrow(from.address, contractAddress, tokenId, amount)

    const result = (await this.sdkService.getSdk().multiToken.send.transferMultiTokenTransaction({
      chain: this.chain,
      to: to.address,
      tokenId,
      amount,
      contractAddress,
      fromPrivateKey: from.privateKey,
    })) as TransactionHash
    Logger.log(
      `Transfer: ${from.address} -> ${to.address}: Token [ERC1155] : ${tokenId}. TxId: ${result.txId}`,
    )
    return result
  }

  public async burnErc1155() {
    const { contractAddress } = await this.readContractAddressOrThrow()
    const existingWallet = await this.walletStoreService.readOrThrow(this.chain)
    const address = existingWallet.addresses[0]
    const tokenId = '1337'
    const amount = '100'

    await this.checkErc1155BalanceOrThrow(address.address, contractAddress, tokenId, amount)

    const result = (await this.sdkService.getSdk().multiToken.send.burnMultiTokenTransaction({
      chain: this.chain,
      account: address.address,
      tokenId,
      amount,
      contractAddress,
      fromPrivateKey: address.privateKey,
    })) as TransactionHash
    Logger.log(
      `Burn: [ERC1155] ${amount} Tokens with id [${tokenId}] burned on contract ${contractAddress}. TxId: ${result.txId}`,
    )
    return result
  }

  private async checkErc1155BalanceOrThrow(
    address: string,
    contractAddress: string,
    tokenId: string,
    amount: string,
  ) {
    const { data } = await this.sdkService
      .getSdk()
      .multiToken.getBalance(this.chain, address, contractAddress, tokenId)
    const balance = new BigNumber(data || '0')

    if (balance.lt(new BigNumber(amount))) {
      throw new BadRequestException({
        msg: `ERC1155 [${contractAddress}] Token [${tokenId}] Balance [${balance.toFixed()}] of an address is less than operation amount [${amount}]`,
      })
    }
  }

  private async readContractAddressOrThrow(): Promise<GeneratedContractWithAddress> {
    const existingContract = await this.contractStoreService.readOrThrow(this.chain, Contract.ERC1155)

    if (existingContract.contractAddress) {
      return existingContract as GeneratedContractWithAddress
    }

    try {
      const transaction = await this.evmService.getTransaction(existingContract.txId)

      const contract = {
        ...existingContract,
        contractAddress: transaction.contractAddress,
      }

      await this.contractStoreService.write(this.chain, Contract.ERC1155, contract)
      Logger.log(`Detected erc1155 contract address: ${contract.contractAddress}`)

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
