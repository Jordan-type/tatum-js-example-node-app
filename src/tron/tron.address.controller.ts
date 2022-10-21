import { Controller, Get, Param } from '@nestjs/common'
import { GetBalanceDto } from '../common/dto/common.dto'
import { TronService } from './tron.service'

@Controller('tron/address')
export class TronAddressController {
  constructor(private readonly tronService: TronService) {}

  @Get(':address/balance')
  public getBalance(@Param() param: GetBalanceDto) {
    return this.tronService.getAddressBalance(param.address)
  }
}
