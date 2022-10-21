import { Controller, Post } from '@nestjs/common'
import { TronTrc721Service } from './tron.trc721.service'

@Controller('tron/trc721')
export class TronTrc721Controller {
  constructor(private readonly tronTrc721Service: TronTrc721Service) {}

  @Post('deploy')
  public deploy() {
    return this.tronTrc721Service.deployContract()
  }

  @Post('transfer')
  public transferErc721() {
    return this.tronTrc721Service.transferTrc721()
  }

  @Post('mint')
  public mint() {
    return this.tronTrc721Service.mintTrc721()
  }

  @Post('burn')
  public burn() {
    return this.tronTrc721Service.burnTrc721()
  }
}
