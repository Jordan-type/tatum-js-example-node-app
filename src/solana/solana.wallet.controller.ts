import { Body, Controller, Post } from '@nestjs/common'
import { GeneratePrivateKeyDto, GenerateWalletDto } from '../common/dto/common.dto'
import { SolanaService } from './solana.service'

@Controller('solana/wallet')
export class SolanaWalletController {
  constructor(private readonly solanaService: SolanaService) {}

  @Post()
  public async generateWalletFromMnemonic(@Body() body: GenerateWalletDto) {
    return this.solanaService.generateWallet(body.mnemonic)
  }

  @Post('address')
  public async generateAddressAndPrivateKey(@Body() body: GeneratePrivateKeyDto) {
    return this.solanaService.generateAddressAndKey(body.mnemonic, body.index)
  }
}
