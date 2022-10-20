import { Controller, Get, Param, Post } from '@nestjs/common'
import { BtcService } from './btc.service'
import { GetTransactionDto } from '../common/dto/common.dto'

@Controller('btc/transaction')
export class BtcTransactionController {
  constructor(private readonly service: BtcService) {}

  @Get(':hash')
  public async getTransaction(@Param() param: GetTransactionDto) {
    return this.service.getTransaction(param.hash)
  }

  @Post('transfer')
  public async transfer() {
    return this.service.transfer()
  }
}
