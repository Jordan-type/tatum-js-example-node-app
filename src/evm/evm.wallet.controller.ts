import { Body, Get, Param, Post } from '@nestjs/common'
import { EvmService } from './evm.service'
import { GenerateAddressDto, GeneratePrivateKeyDto, GenerateWalletDto } from '../common/dto/common.dto'

export abstract class EvmWalletController {
  protected constructor(private readonly evmService: EvmService) {}

  @Post()
  public async generateWalletFromMnemonic(@Body() body: GenerateWalletDto) {
    return this.evmService.generateWallet(body.mnemonic)
  }

  @Post('key')
  public async generatePrivateKey(@Body() body: GeneratePrivateKeyDto) {
    return {
      key: await this.evmService.generatePrivateKey(body.mnemonic, body.index),
    }
  }

  @Get('address/:xpub/:index')
  public generateAddress(@Param() param: GenerateAddressDto) {
    return {
      address: this.evmService.generateAddress(param.xpub, param.index),
    }
  }
}
