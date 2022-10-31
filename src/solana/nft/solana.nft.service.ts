import { WalletStoreService } from '../../common/services/wallet.store.service'
import { ContractStoreService } from '../../common/services/contract.store.service'
import { SolanaSdkService } from '../solana.sdk.service'
import { SolanaService } from '../solana.service'
import { Chain } from '../../common/dto/chain.enum'
import { Contract } from '../../common/dto/contract.enum'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class SolanaNftService {
  constructor(
    readonly sdkService: SolanaSdkService,
    readonly solanaService: SolanaService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {}

  public async mintNft() {
    const existing = await this.walletStoreService.readOrThrow(Chain.SOL)
    const wallet = existing.addresses[0]

    const result = (await this.sdkService.getSdk().transaction.mintNft({
      chain: 'SOL',
      to: wallet.address,
      from: wallet.address,
      fromPrivateKey: wallet.privateKey,
      metadata: {
        name: 'My NFT.',
        symbol: 'NFT_SYMBOL',
        sellerFeeBasisPoints: 0,
        uri: 'https://tatum.io',
      },
    })) as { txId: string; nftAddress: string }
    await this.contractStoreService.write(Chain.SOL, Contract.NFT, {
      ...result,
      creator: wallet.address,
      contractAddress: result.nftAddress,
    })
    Logger.log(`NFT token minted. Address: ${result.nftAddress}. TxId: ${result.txId}`)
    return result
  }
}
