import { BadRequestException, Injectable } from '@nestjs/common'
import * as fs from 'fs'
import { Chain } from '../dto/chain.enum'
import { Contract } from '../dto/contract.enum'
import {
  GeneratedContract,
  GeneratedContractWithAddress,
  GeneratedContractWithTokenId,
} from '../dto/generated.contract.dto'

@Injectable()
export class ContractStoreService {
  public async write(chain: Chain, contract: Contract, generatedContract: GeneratedContract) {
    await fs.promises.writeFile(
      this.contractFile(chain, contract),
      JSON.stringify(generatedContract, null, 2),
      {
        encoding: 'utf8',
      },
    )
  }

  public async read(chain: Chain, contract: Contract): Promise<GeneratedContract | null> {
    try {
      const data = await fs.promises.readFile(this.contractFile(chain, contract), {
        encoding: 'utf8',
      })
      return JSON.parse(data) as GeneratedContract
    } catch (e) {
      return null
    }
  }

  public async readOrThrow(chain: Chain, contract: Contract): Promise<GeneratedContract> {
    const existing = await this.read(chain, contract)
    if (existing === null) {
      throw new BadRequestException('Please deploy your contract first')
    }
    return existing
  }

  private contractFile(chain: Chain, contract: Contract): string {
    return `contract-${chain.toLowerCase()}-${contract.toLowerCase()}.json`
  }

  public isContractWithAddress(contract: GeneratedContract): contract is GeneratedContractWithAddress {
    return contract.contractAddress !== undefined
  }

  public isContractWithTokenId(contract: GeneratedContract): contract is GeneratedContractWithTokenId {
    return contract.tokenId !== undefined
  }
}
