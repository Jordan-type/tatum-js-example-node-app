import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BtcService } from './btc/btc.service'
import { WalletStoreService } from './common/services/wallet.store.service'
import { EthService } from './eth/eth.service'
import { BtcBlockController } from './btc/btc.block.controller'
import { BtcWalletController } from './btc/btc.wallet.controller'
import { BtcAddressController } from './btc/btc.address.controller'
import { BtcTransactionController } from './btc/btc.transaction.controller'
import { ContractStoreService } from './common/services/contract.store.service'
import { EthSdkService } from './eth/eth.sdk.service'
import {
  PolygonWalletController,
  PolygonTransactionController,
  PolygonBlockController,
  PolygonErc721Controller,
  PolygonErc20Controller,
  PolygonAddressController,
  PolygonErc1155Controller,
} from './polygon/polygon.controller'
import { PolygonSdkService } from './polygon/polygon.sdk.service'
import { PolygonService } from './polygon/polygon.serivce'
import {
  PolygonErc20Service,
  PolygonErc1155Service,
  PolygonErc721Service,
} from './polygon/polygon.contract.service'
import { EthErc1155Service, EthErc20Service, EthErc721Service } from './eth/eth.contract.service'
import {
  EthAddressController,
  EthBlockController,
  EthErc1155Controller,
  EthErc20Controller,
  EthErc721Controller,
  EthTransactionController,
  EthWalletController,
} from './eth/eth.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    WalletStoreService,
    ContractStoreService,
    EthSdkService,
    EthService,
    EthErc20Service,
    EthErc721Service,
    EthErc1155Service,
    PolygonSdkService,
    PolygonService,
    PolygonErc20Service,
    PolygonErc721Service,
    PolygonErc1155Service,
    BtcService,
  ],
  controllers: [
    EthAddressController,
    EthTransactionController,
    EthBlockController,
    EthWalletController,
    EthErc20Controller,
    EthErc721Controller,
    EthErc1155Controller,
    BtcAddressController,
    BtcTransactionController,
    BtcBlockController,
    BtcWalletController,
    PolygonAddressController,
    PolygonTransactionController,
    PolygonBlockController,
    PolygonWalletController,
    PolygonErc20Controller,
    PolygonErc721Controller,
    PolygonErc1155Controller,
  ],
})
export class AppModule {}
