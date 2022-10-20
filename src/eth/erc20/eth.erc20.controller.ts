import { Controller, Post } from '@nestjs/common'
import { EthErc20Service } from './eth.erc20.service'

@Controller('eth/erc20')
export class EthErc20Controller {
  constructor(private readonly ethErc20Service: EthErc20Service) {}

  @Post('deploy')
  public deploy() {
    return this.ethErc20Service.deployContract()
  }

  @Post('transfer')
  public transferErc20() {
    return this.ethErc20Service.transferErc20()
  }

  @Post('mint')
  public mint() {
    return this.ethErc20Service.mintErc20()
  }

  @Post('burn')
  public burn() {
    return this.ethErc20Service.burnErc20()
  }
}
