import { Controller, Get, Param } from '@nestjs/common'
import { GetBalanceDto } from '../common/dto/common.dto'
import { SolanaService } from './solana.service'

@Controller('solana/address')
export class SolanaAddressController {
  constructor(private readonly solanaService: SolanaService) {}

  @Get(':address/balance')
  public getBalance(@Param() param: GetBalanceDto) {
    return this.solanaService.getAddressBalance(param.address)
  }
}
