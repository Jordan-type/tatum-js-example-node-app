import { Module } from '@nestjs/common'
import { EthModule } from './eth/eth.module'
import { ConfigModule } from '@nestjs/config'
import { BtcWalletController } from './btc/btc.wallet.controller'
import { CommonModule } from './common/common.module'
import { BtcModule } from './btc/btc.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    EthModule,
    BtcModule,
  ],
})
export class AppModule {}
