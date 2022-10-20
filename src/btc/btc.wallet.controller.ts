import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { BtcService } from './btc.service'
import { GenerateAddressDto, GeneratePrivateKeyDto, GenerateWalletDto } from '../common/dto/common.dto'

@Controller('btc/wallet')
export class BtcWalletController {
  constructor(private readonly btcService: BtcService) {}

  @Post()
  public async generateWalletFromMnemonic(@Body() body: GenerateWalletDto) {
    return this.btcService.generateWalletAndAddresses(body.mnemonic)
  }

  @Post('key')
  public async generatePrivateKey(@Body() body: GeneratePrivateKeyDto) {
    return {
      key: await this.btcService.generatePrivateKey(body.mnemonic, body.index),
    }
  }

  @Get('address/:xpub/:index')
  public generateAddress(@Param() param: GenerateAddressDto) {
    return {
      address: this.btcService.generateAddress(param.xpub, param.index),
    }
  }
}
