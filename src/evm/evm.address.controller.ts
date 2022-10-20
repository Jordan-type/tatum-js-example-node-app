import { Get, Param } from '@nestjs/common'
import { EvmService } from './evm.service'
import { GetBalanceDto } from '../common/dto/common.dto'

export abstract class EvmAddressController {
  protected constructor(private readonly evmService: EvmService) {}

  @Get(':address/balance')
  public getBalance(@Param() param: GetBalanceDto) {
    return this.evmService.getAddressBalance(param.address)
  }
}
