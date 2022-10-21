import { Controller, Post } from '@nestjs/common'
import { TronTrc10Service } from './tron.trc10.service'

@Controller('tron/trc10')
export class TronTrc10Controller {
  constructor(private readonly tronTrc10Service: TronTrc10Service) {}

  @Post('deploy')
  public deploy() {
    return this.tronTrc10Service.deployContract()
  }

  @Post('transfer')
  public transferTrc10() {
    return this.tronTrc10Service.transferTrc10()
  }
}
