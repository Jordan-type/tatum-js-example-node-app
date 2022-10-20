import { Post } from '@nestjs/common'
import { EvmErc1155Service } from './evm.erc1155.service'

export abstract class EvmErc1155Controller {
  protected constructor(private readonly evmErc1155Service: EvmErc1155Service) {}

  @Post('deploy')
  public deploy() {
    return this.evmErc1155Service.deployContract()
  }

  @Post('transfer')
  public transferErc1155() {
    return this.evmErc1155Service.transferErc1155()
  }

  @Post('mint')
  public mint() {
    return this.evmErc1155Service.mintErc1155()
  }

  @Post('burn')
  public burn() {
    return this.evmErc1155Service.burnErc1155()
  }
}
