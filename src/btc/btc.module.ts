import { Module } from '@nestjs/common'
import { BtcService } from './btc.service'
import { BtcWalletController } from './btc.wallet.controller'

@Module({
  imports: [],
  controllers: [BtcWalletController],
  providers: [BtcService],
})
export class BtcModule {}
