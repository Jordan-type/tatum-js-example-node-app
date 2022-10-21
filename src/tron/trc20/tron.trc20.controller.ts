import { Controller, Post } from '@nestjs/common'
import { TronTrc20Service } from './tron.trc20.service'

@Controller('tron/trc20')
export class TronTrc20Controller {
  constructor(private readonly tronTrc20Service: TronTrc20Service) {}

  @Post('deploy')
  public deploy() {
    return this.tronTrc20Service.deployContract()
  }

  @Post('transfer')
  public transferTrc20() {
    return this.tronTrc20Service.transferTrc20()
  }
}
