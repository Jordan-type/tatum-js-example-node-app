import { Injectable } from '@nestjs/common'
import BigNumber from 'bignumber.js'
import { WalletStoreService } from '../common/services/wallet.store.service'
import { Chain } from '../common/dto/chain.enum'
import { EthSdkService } from './eth.sdk.service'
import { EvmService } from '../evm/evm.service'

@Injectable()
export class EthService extends EvmService {
  constructor(readonly sdkService: EthSdkService, readonly walletStoreService: WalletStoreService) {
    super(Chain.ETH, sdkService, walletStoreService)
  }

  public async estimateFee(from: string, amount: string, to: string, contractAddress?: string) {
    const sdk = this.sdkService.getSdk()

    const estimateGas = await sdk.blockchain.estimateGas({
      amount,
      from,
      to,
      contractAddress,
    })

    const gasPrice = new BigNumber(estimateGas.estimations.standard).div(new BigNumber(10).pow(9))
    const gasLimit = new BigNumber(estimateGas.gasLimit)

    const fee = gasPrice.multipliedBy(gasLimit).div(new BigNumber(10).pow(8))

    return { gasPrice, gasLimit, fee }
  }
}
