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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [WalletStoreService, EthService, BtcService],
  controllers: [
    EthAddressController,
    EthTransactionController,
    EthBlockController,
    EthWalletController,
    BtcAddressController,
    BtcTransactionController,
    BtcBlockController,
    BtcWalletController,
  ],
})
export class AppModule {}
