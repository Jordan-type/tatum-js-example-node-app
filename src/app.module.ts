import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BtcService } from './btc/btc.service'
import { WalletStoreService } from './common/services/wallet.store.service'
import { EthService } from './eth/eth.service'
import { EthAddressController } from './eth/eth.address.controller'
import { EthWalletController } from './eth/eth.wallet.controller'
import { EthTransactionController } from './eth/eth.transaction.controller'
import { EthBlockController } from './eth/eth.block.controller'
import { BtcBlockController } from './btc/btc.block.controller'
import { BtcWalletController } from './btc/btc.wallet.controller'
import { BtcAddressController } from './btc/btc.address.controller'
import { BtcTransactionController } from './btc/btc.transaction.controller'
import { ContractStoreService } from './common/services/contract.store.service'
import { EthErc20Controller } from './eth/erc20/eth.erc20.controller'
import { EthSdkService } from './eth/eth.sdk.service'
import { EthErc20Service } from './eth/erc20/eth.erc20.service'
import { EthErc721Service } from './eth/erc721/eth.erc721.service'
import { EthErc721Controller } from './eth/erc721/eth.erc721.controller'

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
    BtcService,
  ],
  controllers: [
    EthAddressController,
    EthTransactionController,
    EthBlockController,
    EthWalletController,
    EthErc20Controller,
    EthErc721Controller,
    BtcAddressController,
    BtcTransactionController,
    BtcBlockController,
    BtcWalletController,
  ],
})
export class AppModule {}
