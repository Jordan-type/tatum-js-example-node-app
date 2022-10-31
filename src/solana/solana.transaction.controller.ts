import { Controller, Get, Param, Post } from '@nestjs/common'
import { GetTransactionDto } from '../common/dto/common.dto'
import { SolanaService } from './solana.service'

@Controller('solana/transaction')
export class SolanaTransactionController {
  constructor(private readonly solanaService: SolanaService) {}

  @Get(':hash')
  public async getTransaction(@Param() param: GetTransactionDto) {
    return this.solanaService.getTransaction(param.hash)
  }

  @Post()
  public sendNative() {
    return this.solanaService.transferNativeFromExistingWallet()
  }
}
