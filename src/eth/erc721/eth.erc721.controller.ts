import { Controller, Post } from '@nestjs/common'
import { EthErc721Service } from './eth.erc721.service'

@Controller('eth/erc721')
export class EthErc721Controller {
  constructor(private readonly ethErc20Service: EthErc721Service) {}

  @Post('deploy')
  public deploy() {
    return this.ethErc20Service.deployContract()
  }

  @Post('transfer')
  public transferErc721() {
    return this.ethErc20Service.transferErc721()
  }

  @Post('mint')
  public mint() {
    return this.ethErc20Service.mintErc721()
  }

  @Post('burn')
  public burn() {
    return this.ethErc20Service.burnErc721()
  }
}
