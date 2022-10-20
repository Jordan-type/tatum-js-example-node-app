import { Controller, Get, Param } from '@nestjs/common'
import { BtcService } from './btc.service'
import { GetBlockDto } from '../common/dto/common.dto'

@Controller('btc/block')
export class BtcBlockController {
  constructor(private readonly service: BtcService) {}

  @Get('current')
  public async getCurrentBlock() {
    return {
      block: await this.service.getCurrentBlock(),
    }
  }

  @Get(':hashOrNumber')
  public async getBlock(@Param() param: GetBlockDto) {
    return this.service.getBlock(param.hashOrNumber)
  }
}
