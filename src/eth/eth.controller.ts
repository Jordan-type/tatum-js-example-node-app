import { Controller, Get, Param } from '@nestjs/common'
import { EthService } from './eth.service'
import { GenerateAddressQuery } from './eth.dto'

@Controller('eth')
export class EthController {
  constructor(private readonly ethService: EthService) {}

  @Get('address/:xpub/:index')
  public generateWallet(@Param() param: GenerateAddressQuery) {
    return {
      address: this.ethService.generateWallet(param.xpub, param.index),
    }
  }
}
