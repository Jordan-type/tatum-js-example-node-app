import { Controller, Post } from '@nestjs/common'
import { SolanaSplService } from './solana.spl.service'

@Controller('solana/spl')
export class SolanaSplController {
  constructor(private readonly solanaSplService: SolanaSplService) {}

  @Post('deploy')
  public deploy() {
    return this.solanaSplService.createSplToken()
  }

  @Post('transfer')
  public transferSpl() {
    return this.solanaSplService.transferSpl()
  }
}
