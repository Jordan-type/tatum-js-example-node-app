import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { WalletStoreService } from '../../common/services/wallet.store.service'
import { ContractStoreService } from '../../common/services/contract.store.service'
import { Chain } from '../../common/dto/chain.enum'
import { Contract } from '../../common/dto/contract.enum'
import { TronSdkService } from '../tron.sdk.service'
import { TronService } from '../tron.service'
import { GeneratedContractWithAddress } from '../../common/dto/generated.contract.dto'
import { TransactionHash } from '@tatumio/api-client'

export const TRC721_CONTRACT_CONSTANTS = {
  symbol: 'ENFT',
  name: 'Example NFT',
}

@Injectable()
export class TronTrc721Service {
  constructor(
    readonly sdkService: TronSdkService,
    readonly tronService: TronService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {}

  public async deployContract() {
    const existingContract = await this.contractStoreService.read(Chain.TRON, Contract.TRC721)
    if (existingContract !== null) {
      return existingContract
    }

    const existing = await this.walletStoreService.readOrThrow(Chain.TRON)
    const wallet = existing.addresses[0]

    const result = (await this.sdkService.getSdk().nft.send.deploySignedTransaction({
      ...TRC721_CONTRACT_CONSTANTS,
      chain: Chain.TRON,
      fromPrivateKey: wallet.privateKey,
      feeLimit: 10000,
    })) as TransactionHash
    await this.contractStoreService.write(Chain.TRON, Contract.TRC721, {
      ...result,
      creator: wallet.address,
    })
    Logger.log(`TRC721 SC deployed. TxId: ${result.txId}`)
    return result
  }

  public async mintTrc721() {
    const { contractAddress } = await this.readContractAddressOrThrow()
    const existingWallet = await this.walletStoreService.readOrThrow(Chain.TRON)
    const address = existingWallet.addresses[0]

    const result = (await this.sdkService.getSdk().nft.send.mintSignedTransaction({
      chain: Chain.TRON,
      tokenId: '1337',
      to: address.address,
      contractAddress,
      url: 'ipfs://bafkreia4mipjd7u5nn55xqlex4ezsvbbpjmvy4bhl6zpb3wrhdtj2k2mme',
      fromPrivateKey: address.privateKey,
      feeLimit: 100,
    })) as TransactionHash
    Logger.log(`Mint: Token with id [1337] successfully minted. TxId: ${result.txId}`)

    return result
  }

  public async transferTrc721() {
    const { contractAddress } = await this.readContractAddressOrThrow()

    const existingWallet = await this.walletStoreService.readOrThrow(Chain.TRON)
    const from = existingWallet.addresses[0]
    const to = existingWallet.addresses[1]
    const tokenId = '1337'

    await this.checkTrc721BalanceOrThrow(from.address, contractAddress, tokenId)

    const result = (await this.sdkService.getSdk().nft.send.transferSignedTransaction({
      chain: Chain.TRON,
      to: to.address,
      tokenId,
      contractAddress,
      fromPrivateKey: from.privateKey,
      feeLimit: 100,
    })) as TransactionHash
    Logger.log(
      `Transfer: ${from.address} -> ${to.address}: Token [TRC721] : ${tokenId}. TxId: ${result.txId}`,
    )
    return result
  }

  public async burnTrc721() {
    const { contractAddress } = await this.readContractAddressOrThrow()
    const existingWallet = await this.walletStoreService.readOrThrow(Chain.TRON)
    const address = existingWallet.addresses[1]
    const tokenId = '1337'

    await this.checkTrc721BalanceOrThrow(address.address, contractAddress, tokenId)

    const result = (await this.sdkService.getSdk().nft.send.burnSignedTransaction({
      chain: Chain.TRON,
      tokenId,
      contractAddress,
      fromPrivateKey: address.privateKey,
      feeLimit: 100,
    })) as TransactionHash
    Logger.log(
      `Burn: [TRC721] Token with id [${tokenId}] burned on contract ${contractAddress}. TxId: ${result.txId}`,
    )
    return result
  }

  private async checkTrc721BalanceOrThrow(address: string, contractAddress: string, tokenId: string) {
    // @TODO - openapi bug
    const { data } = (await this.sdkService
      .getSdk()
      .nft.getNFTAccountBalance(Chain.TRON, address, contractAddress)) as any as { data: string[] }

    if (!data.includes(tokenId)) {
      throw new BadRequestException({
        msg: `Address [${address}] doesn't have token with id [${tokenId}]`,
      })
    }
  }

  private async readContractAddressOrThrow(): Promise<GeneratedContractWithAddress> {
    const existingContract = await this.contractStoreService.readOrThrow(Chain.TRON, Contract.TRC721)

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

      await this.contractStoreService.write(Chain.TRON, Contract.TRC721, contract)
      Logger.log(`Detected trc721 contract address: ${contract.contractAddress}`)

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
