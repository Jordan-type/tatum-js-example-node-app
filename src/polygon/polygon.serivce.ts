import { Injectable } from '@nestjs/common'
import { EvmService } from '../evm/evm.service'
import { PolygonSdkService } from './polygon.sdk.service'
import { WalletStoreService } from '../common/services/wallet.store.service'
import { Chain } from '../common/dto/chain.enum'
import BigNumber from 'bignumber.js'

@Injectable()
export class PolygonService extends EvmService {
  constructor(readonly sdkService: PolygonSdkService, readonly walletStoreService: WalletStoreService) {
    super(Chain.MATIC, sdkService, walletStoreService)
  }

  public async estimateFee(from: string, amount: string, to: string, _contractAddress?: string) {
    const sdk = this.sdkService.getSdk()

    const estimateGas = await sdk.blockchain.estimateGas({
      amount,
      from,
      to,
    })

    // @TODO - fix this logic

    const gasPriceConst = new BigNumber(40)

    const gasPrice = BigNumber.max(
      new BigNumber(estimateGas.gasPrice).div(new BigNumber(10).pow(9)),
      gasPriceConst,
    )
    const gasLimit = _contractAddress
      ? new BigNumber(estimateGas.gasLimit).multipliedBy(new BigNumber(3))
      : new BigNumber(estimateGas.gasLimit)

    const fee = gasPrice.multipliedBy(gasLimit).div(new BigNumber(10).pow(8))

    return { gasPrice, gasLimit, fee }
  }
}
