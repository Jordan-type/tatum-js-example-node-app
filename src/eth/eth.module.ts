import { Module } from '@nestjs/common'
import { EthService } from './eth.service'
import { EthWalletController } from './eth.wallet.controller'
import { EthBlockController } from './eth.block.controller'
import { EthTransactionController } from './eth.transaction.controller'
import { EthAddressController } from './eth.address.controller'

@Module({
  imports: [],
  controllers: [EthWalletController, EthBlockController, EthTransactionController, EthAddressController],
  providers: [EthService],
})
export class EthModule {}
