import { Controller, Get, Param } from '@nestjs/common'
import { EthService } from './eth.service'
import { GetBlockDto } from './eth.dto'

@Controller('eth/block')
export class EthBlockController {
  constructor(private readonly ethService: EthService) {}

  @Get('current')
  public async getCurrentBlock() {
    return {
      block: await this.ethService.getCurrentBlock(),
    }
  }

  @Get(':hashOrNumber')
  public async getBlock(@Param() param: GetBlockDto) {
    return this.ethService.getBlock(param.hashOrNumber)
  }
}
