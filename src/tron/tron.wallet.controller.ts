import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { GenerateAddressDto, GeneratePrivateKeyDto, GenerateWalletDto } from '../common/dto/common.dto'
import { TronService } from './tron.service'

@Controller('tron/wallet')
export class TronWalletController {
  constructor(private readonly tronService: TronService) {}

  @Post()
  public async generateWalletFromMnemonic(@Body() body: GenerateWalletDto) {
    return this.tronService.generateWallet(body.mnemonic)
  }

  @Post('key')
  public async generatePrivateKey(@Body() body: GeneratePrivateKeyDto) {
    return {
      key: await this.tronService.generatePrivateKey(body.mnemonic, body.index),
    }
  }

  @Get('address/:xpub/:index')
  public generateAddress(@Param() param: GenerateAddressDto) {
    return {
      address: this.tronService.generateAddress(param.xpub, param.index),
    }
  }
}
