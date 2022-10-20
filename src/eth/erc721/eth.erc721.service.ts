import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { WalletStoreService } from '../../common/services/wallet.store.service'
import { EthSdkService } from '../eth.sdk.service'
import { ContractStoreService } from '../../common/services/contract.store.service'
import { Chain } from '../../common/dto/chain.enum'
import { Contract } from '../../common/dto/contract.enum'
import { GeneratedContract, GeneratedContractWithAddress } from '../../common/dto/generated.contract.dto'
import { EthService } from '../eth.service'
import { TransactionHash } from '@tatumio/api-client'

export const ERC721_CONTRACT_CONSTANTS = {
  symbol: 'ENFT',
  name: 'Example NFT',
  totalCap: '1000000',
  digits: 2,
}

@Injectable()
export class EthErc721Service {
  constructor(
    readonly sdkService: EthSdkService,
    readonly ethService: EthService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {}

  public async deployContract() {
    const existingContract = await this.contractStoreService.read(Chain.ETH, Contract.ERC721)
    if (existingContract !== null) {
      return existingContract
    }

    const existing = await this.walletStoreService.readOrThrow(Chain.ETH)
    const wallet = existing.addresses[0]

    const result: GeneratedContract = (await this.sdkService.getSdk().nft.send.deploySignedTransaction({
      ...ERC721_CONTRACT_CONSTANTS,
      chain: Chain.ETH,
      fromPrivateKey: wallet.privateKey,
    })) as TransactionHash
    await this.contractStoreService.write(Chain.ETH, Contract.ERC721, result)
    Logger.log(`ERC721 SC deployed. TxId: ${result.txId}`)
    return result
  }

  public async mintErc721() {
    const { contractAddress } = await this.readContractAddressOrThrow()
    const existingWallet = await this.walletStoreService.readOrThrow(Chain.ETH)
    const address = existingWallet.addresses[0]

    const result = (await this.sdkService.getSdk().nft.send.mintSignedTransaction({
      chain: Chain.ETH,
      tokenId: '1337',
      to: address.address,
      contractAddress,
      url: 'ipfs://bafkreia4mipjd7u5nn55xqlex4ezsvbbpjmvy4bhl6zpb3wrhdtj2k2mme',
      fromPrivateKey: address.privateKey,
    })) as TransactionHash
    Logger.log(`Mint: Token with id [1337] successfully minted. TxId: ${result.txId}`)

    return result
  }

  public async transferErc721() {
    const { contractAddress } = await this.readContractAddressOrThrow()

    const existingWallet = await this.walletStoreService.readOrThrow(Chain.ETH)
    const from = existingWallet.addresses[0]
    const to = existingWallet.addresses[1]
    const tokenId = '1337'

    await this.checkErc721BalanceOrThrow(from.address, contractAddress, tokenId)

    const result = (await this.sdkService.getSdk().nft.send.transferSignedTransaction({
      chain: Chain.ETH,
      to: to.address,
      tokenId,
      contractAddress,
      fromPrivateKey: from.privateKey,
    })) as TransactionHash
    Logger.log(
      `Transfer: ${from.address} -> ${to.address}: Token [ERC721] : ${tokenId}. TxId: ${result.txId}`,
    )
    return result
  }

  public async burnErc721() {
    const { contractAddress } = await this.readContractAddressOrThrow()
    const existingWallet = await this.walletStoreService.readOrThrow(Chain.ETH)
    const address = existingWallet.addresses[1]
    const tokenId = '1337'

    await this.checkErc721BalanceOrThrow(address.address, contractAddress, tokenId)

    const result = (await this.sdkService.getSdk().nft.send.burnSignedTransaction({
      chain: Chain.ETH,
      tokenId,
      contractAddress,
      fromPrivateKey: address.privateKey,
    })) as TransactionHash
    Logger.log(
      `Burn: [ERC721] Token with id [${tokenId}] burned on contract ${contractAddress}. TxId: ${result.txId}`,
    )
    return result
  }

  private async checkErc721BalanceOrThrow(address: string, contractAddress: string, tokenId: string) {
    // @TODO - openapi bug
    const { data } = (await this.sdkService
      .getSdk()
      .nft.getNFTAccountBalance(Chain.ETH, address, contractAddress)) as any as { data: string[] }

    if (!data.includes(tokenId)) {
      throw new BadRequestException({
        msg: `Address [${address}] doesn't have token with id [${tokenId}]`,
      })
    }
  }

  private async readContractAddressOrThrow(): Promise<GeneratedContractWithAddress> {
    const existingContract = await this.contractStoreService.readOrThrow(Chain.ETH, Contract.ERC721)

    if (existingContract.contractAddress) {
      return existingContract as GeneratedContractWithAddress
    }

    try {
      const transaction = await this.ethService.getTransaction(existingContract.txId)

      const contract = {
        ...existingContract,
        contractAddress: transaction.contractAddress,
      }

      await this.contractStoreService.write(Chain.ETH, Contract.ERC721, contract)
      Logger.log(`Detected erc721 contract address: ${contract.contractAddress}`)

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
