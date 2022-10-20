import { Module } from '@nestjs/common'
import { WalletStoreService } from './services/wallet.store.service'

@Module({
  imports: [],
  controllers: [],
  providers: [WalletStoreService],
  exports: [WalletStoreService],
})
export class CommonModule {}
