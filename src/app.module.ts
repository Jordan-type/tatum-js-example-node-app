import { Module } from '@nestjs/common'
import { EthModule } from './eth/eth.module'
import { ConfigModule } from '@nestjs/config'
import { BtcModule } from './btc/btc.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EthModule,
    BtcModule,
  ],
})
export class AppModule {}
