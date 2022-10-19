import { Module } from '@nestjs/common'
import { EthModule } from './eth/eth.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EthModule,
  ],
})
export class AppModule {}
