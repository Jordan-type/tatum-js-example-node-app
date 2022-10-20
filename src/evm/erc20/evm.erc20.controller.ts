import { Post } from '@nestjs/common'
import { EvmErc20Service } from './evm.erc20.service'

export class EvmErc20Controller {
  constructor(private readonly evmErc20Service: EvmErc20Service) {}

  @Post('deploy')
  public deploy() {
    return this.evmErc20Service.deployContract()
  }

  @Post('transfer')
  public transferErc20() {
    return this.evmErc20Service.transferErc20()
  }

  @Post('mint')
  public mint() {
    return this.evmErc20Service.mintErc20()
  }

  @Post('burn')
  public burn() {
    return this.evmErc20Service.burnErc20()
  }
}
