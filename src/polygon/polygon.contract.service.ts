import { Injectable } from '@nestjs/common'
import { EvmErc20Service } from '../evm/erc20/evm.erc20.service'
import { PolygonSdkService } from './polygon.sdk.service'
import { PolygonService } from './polygon.serivce'
import { WalletStoreService } from '../common/services/wallet.store.service'
import { ContractStoreService } from '../common/services/contract.store.service'
import { Chain } from '../common/dto/chain.enum'
import { EvmErc721Service } from '../evm/erc721/evm.erc721.service'
import { EvmErc1155Service } from '../evm/erc1155/evm.erc1155.service'

@Injectable()
export class PolygonErc20Service extends EvmErc20Service {
  constructor(
    readonly sdkService: PolygonSdkService,
    readonly ethService: PolygonService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {
    super(Chain.MATIC, sdkService, ethService, walletStoreService, contractStoreService)
  }
}

@Injectable()
export class PolygonErc721Service extends EvmErc721Service {
  constructor(
    readonly sdkService: PolygonSdkService,
    readonly polygonService: PolygonService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {
    super(Chain.MATIC, sdkService, polygonService, walletStoreService, contractStoreService)
  }
}

@Injectable()
export class PolygonErc1155Service extends EvmErc1155Service {
  constructor(
    readonly sdkService: PolygonSdkService,
    readonly polygonService: PolygonService,
    readonly walletStoreService: WalletStoreService,
    readonly contractStoreService: ContractStoreService,
  ) {
    super(Chain.MATIC, sdkService, polygonService, walletStoreService, contractStoreService)
  }
}
