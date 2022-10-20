import { Controller, Get, Param, Post } from '@nestjs/common'
import { EthService } from './eth.service'
import { GetTransactionDto } from './eth.dto'

@Controller('eth/transaction')
export class EthTransactionController {
  constructor(private readonly ethService: EthService) {}

  @Get(':hash')
  public async getTransaction(@Param() param: GetTransactionDto) {
    return this.ethService.getTransaction(param.hash)
  }

  @Post()
  public sendNative() {
    return this.ethService.transferNativeFromExistingWallet()
  }
}
