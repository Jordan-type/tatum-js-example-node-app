import { Controller, Get, Param } from '@nestjs/common'
import { EthService } from './eth.service'
import { GetTransactionDto } from './eth.dto'

@Controller('eth/transaction')
export class EthTransactionController {
  constructor(private readonly ethService: EthService) {}

  @Get(':hash')
  public async getTransaction(@Param() param: GetTransactionDto) {
    return this.ethService.getTransaction(param.hash)
  }
}
