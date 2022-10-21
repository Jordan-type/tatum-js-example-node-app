import { Controller, Get, Param, Post } from '@nestjs/common'
import { GetTransactionDto } from '../common/dto/common.dto'
import { TronService } from './tron.service'

@Controller('tron/transaction')
export class TronTransactionController {
  constructor(private readonly tronService: TronService) {}

  @Get(':hash')
  public async getTransaction(@Param() param: GetTransactionDto) {
    return this.tronService.getTransaction(param.hash)
  }

  @Post()
  public sendNative() {
    return this.tronService.transferNativeFromExistingWallet()
  }
}
