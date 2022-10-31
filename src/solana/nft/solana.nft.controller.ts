import { Controller, Post } from '@nestjs/common'
import { SolanaNftService } from './solana.nft.service'

@Controller('solana/nft')
export class SolanaNftController {
  constructor(private readonly solanaNftService: SolanaNftService) {}

  // @Post('transfer')
  // public transferErc721() {
  //   return this.evmErc721Service.transferErc721()
  // }

  @Post('mint')
  public mint() {
    return this.solanaNftService.mintNft()
  }

  // @Post('burn')
  // public burn() {
  //   return this.evmErc721Service.burnErc721()
  // }
}
