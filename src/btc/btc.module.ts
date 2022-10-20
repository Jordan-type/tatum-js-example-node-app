import { Module } from '@nestjs/common'
import { BtcService } from './btc.service'
import { BtcWalletController } from './btc.wallet.controller'
import { CommonModule } from '../common/common.module'

@Module({
  imports: [CommonModule],
  controllers: [BtcWalletController],
  providers: [BtcService],
})
export class BtcModule {}
