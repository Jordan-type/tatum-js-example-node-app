import { Get, Param } from '@nestjs/common'
import { EvmService } from './evm.service'
import { GetBlockDto } from '../common/dto/common.dto'

export abstract class EvmBlockController {
  protected constructor(private readonly evmService: EvmService) {}

  @Get('current')
  public async getCurrentBlock() {
    return {
      block: await this.evmService.getCurrentBlock(),
    }
  }

  @Get(':hashOrNumber')
  public async getBlock(@Param() param: GetBlockDto) {
    return this.evmService.getBlock(param.hashOrNumber)
  }
}
