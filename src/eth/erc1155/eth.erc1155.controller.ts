import { Controller, Post } from '@nestjs/common'
import { EthErc1155Service } from './eth.erc1155.service'

@Controller('eth/erc1155')
export class EthErc1155Controller {
  constructor(private readonly ethErc1155Service: EthErc1155Service) {}

  @Post('deploy')
  public deploy() {
    return this.ethErc1155Service.deployContract()
  }

  @Post('transfer')
  public transferErc1155() {
    return this.ethErc1155Service.transferErc1155()
  }

  @Post('mint')
  public mint() {
    return this.ethErc1155Service.mintErc1155()
  }

  @Post('burn')
  public burn() {
    return this.ethErc1155Service.burnErc1155()
  }
}
