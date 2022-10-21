import { Controller, Get, Param } from '@nestjs/common'
import { GetBlockDto } from '../common/dto/common.dto'
import { TronService } from './tron.service'

@Controller('tron/block')
export class TronBlockController {
  constructor(private readonly tronService: TronService) {}

  @Get('current')
  public async getCurrentBlock() {
    return {
      block: await this.tronService.getCurrentBlock(),
    }
  }

  @Get(':hashOrNumber')
  public async getBlock(@Param() param: GetBlockDto) {
    return this.tronService.getBlock(param.hashOrNumber)
  }
}
