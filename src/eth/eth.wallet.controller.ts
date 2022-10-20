import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { EthService } from './eth.service'
import { GenerateAddressDto, GeneratePrivateKeyDto, GenerateWalletDto } from './eth.dto'

@Controller('eth/wallet')
export class EthWalletController {
  constructor(private readonly ethService: EthService) {}

  @Post()
  public async generateWalletFromMnemonic(@Body() body: GenerateWalletDto) {
    return this.ethService.generateWallet(body.mnemonic)
  }

  @Post('key')
  public async generatePrivateKey(@Body() body: GeneratePrivateKeyDto) {
    return {
      key: await this.ethService.generatePrivateKey(body.mnemonic, body.index),
    }
  }

  @Get('address/:xpub/:index')
  public generateAddress(@Param() param: GenerateAddressDto) {
    return {
      address: this.ethService.generateAddress(param.xpub, param.index),
    }
  }
}
