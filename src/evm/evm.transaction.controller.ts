import { Get, Param, Post } from '@nestjs/common'
import { EvmService } from './evm.service'
import { GetTransactionDto } from '../common/dto/common.dto'

export abstract class EvmTransactionController {
  protected constructor(private readonly evmService: EvmService) {}

  @Get(':hash')
  public async getTransaction(@Param() param: GetTransactionDto) {
    return this.evmService.getTransaction(param.hash)
  }

  @Post()
  public sendNative() {
    return this.evmService.transferNativeFromExistingWallet()
  }
}
