import { Controller, Get, Param } from '@nestjs/common'
import { GetBlockByNumberDto, GetBlockDto } from '../common/dto/common.dto'
import { SolanaService } from './solana.service'

@Controller('solana/block')
export class SolanaBlockController {
  constructor(private readonly solanaService: SolanaService) {}

  @Get('current')
  public async getCurrentBlock() {
    return {
      block: await this.solanaService.getCurrentBlock(),
    }
  }

  @Get(':number')
  public async getBlock(@Param() param: GetBlockByNumberDto) {
    return this.solanaService.getBlock(param.number)
  }
}
