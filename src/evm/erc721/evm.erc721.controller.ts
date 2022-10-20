import { Post } from '@nestjs/common'
import { EvmErc721Service } from './evm.erc721.service'

export abstract class EvmErc721Controller {
  protected constructor(private readonly evmErc721Service: EvmErc721Service) {}

  @Post('deploy')
  public deploy() {
    return this.evmErc721Service.deployContract()
  }

  @Post('transfer')
  public transferErc721() {
    return this.evmErc721Service.transferErc721()
  }

  @Post('mint')
  public mint() {
    return this.evmErc721Service.mintErc721()
  }

  @Post('burn')
  public burn() {
    return this.evmErc721Service.burnErc721()
  }
}
