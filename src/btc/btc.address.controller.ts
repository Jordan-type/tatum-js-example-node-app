import { Controller, Get, Param } from '@nestjs/common'
import { BtcService } from './btc.service'
import { GetBalanceDto } from '../common/dto/common.dto'

@Controller('btc/address')
export class BtcAddressController {
  constructor(private readonly service: BtcService) {}

  @Get(':address/balance')
  public getBalance(@Param() param: GetBalanceDto) {
    return this.service.getAddressBalance(param.address)
  }
}
