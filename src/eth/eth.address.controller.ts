import { Controller, Get, Param } from '@nestjs/common'
import { EthService } from './eth.service'
import { GetBalanceDto } from './eth.dto'

@Controller('eth/address')
export class EthAddressController {
  constructor(private readonly ethService: EthService) {}

  @Get(':address/balance')
  public getBalance(@Param() param: GetBalanceDto) {
    return this.ethService.getAddressBalance(param.address)
  }
}
