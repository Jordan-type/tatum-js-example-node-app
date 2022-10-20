import { Injectable } from '@nestjs/common'
import { EvmErc20Service } from '../evm/erc20/evm.erc20.service'
import { EthSdkService } from './eth.sdk.service'
import { EthService } from './eth.service'
import { WalletStoreService } from '../common/services/wallet.store.service'
import { ContractStoreService } from '../common/services/contract.store.service'
import { Chain } from '../common/dto/chain.enum'
import { EvmErc721Service } from '../evm/erc721/evm.erc721.service'
import { EvmErc1155Service } from '../evm/erc1155/evm.erc1155.service'

@Injectable()
export class EthErc20Service extends EvmErc20Service {
  constructor(
    readonly sdkService: EthSdkService,
    readonly ethService: EthService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {
    super(Chain.ETH, sdkService, ethService, walletStoreService, contractStoreService)
  }
}

@Injectable()
export class EthErc721Service extends EvmErc721Service {
  constructor(
    readonly sdkService: EthSdkService,
    readonly ethService: EthService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {
    super(Chain.ETH, sdkService, ethService, walletStoreService, contractStoreService)
  }
}

@Injectable()
export class EthErc1155Service extends EvmErc1155Service {
  constructor(
    readonly sdkService: EthSdkService,
    readonly ethService: EthService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {
    super(Chain.ETH, sdkService, ethService, walletStoreService, contractStoreService)
  }
}
