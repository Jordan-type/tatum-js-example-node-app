import { Injectable, Logger } from '@nestjs/common'
import { GeneratedWalletDto } from '../dto/generated.wallet.dto'
import * as fs from 'fs'
import { Chain } from '../dto/chain.enum'

@Injectable()
export class WalletStoreService {
  public async write(chain: Chain, generatedWallet: GeneratedWalletDto) {
    await fs.promises.writeFile(this.walletFile(chain), JSON.stringify(generatedWallet, null, 2), {
      encoding: 'utf8',
    })
  }

  public async read(chain: Chain): Promise<GeneratedWalletDto | null> {
    try {
      const data = await fs.promises.readFile(this.walletFile(chain), {
        encoding: 'utf8',
      })
      return JSON.parse(data) as GeneratedWalletDto
    } catch (e) {
      return null
    }
  }

  private walletFile(chain: Chain): string {
    return `wallet-${chain.toLowerCase()}.json`
  }
}
