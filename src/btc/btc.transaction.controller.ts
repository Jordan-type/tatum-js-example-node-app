import { Controller, Get, Param } from '@nestjs/common'
import { BtcService } from './btc.service'
import { GetTransactionDto } from '../eth/eth.dto'

@Controller('btc/transaction')
export class BtcTransactionController {
  constructor(private readonly service: BtcService) {}

  @Get(':hash')
  public async getTransaction(@Param() param: GetTransactionDto) {
    return this.service.getTransaction(param.hash)
  }
}
