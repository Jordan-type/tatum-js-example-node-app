import { Controller } from '@nestjs/common'
import { EvmAddressController } from '../evm/evm.address.controller'
import { EthService } from './eth.service'
import { EvmBlockController } from '../evm/evm.block.controller'
import { EvmTransactionController } from '../evm/evm.transaction.controller'
import { EvmWalletController } from '../evm/evm.wallet.controller'
import { EvmErc20Controller } from '../evm/erc20/evm.erc20.controller'
import { EvmErc721Controller } from '../evm/erc721/evm.erc721.controller'
import { EvmErc1155Controller } from '../evm/erc1155/evm.erc1155.controller'
import { EthErc1155Service, EthErc20Service, EthErc721Service } from './eth.contract.service'

@Controller('eth/address')
export class EthAddressController extends EvmAddressController {
  constructor(private readonly ethService: EthService) {
    super(ethService)
  }
}

@Controller('eth/block')
export class EthBlockController extends EvmBlockController {
  constructor(private readonly ethService: EthService) {
    super(ethService)
  }
}

@Controller('eth/transaction')
export class EthTransactionController extends EvmTransactionController {
  constructor(private readonly ethService: EthService) {
    super(ethService)
  }
}

@Controller('eth/wallet')
export class EthWalletController extends EvmWalletController {
  constructor(readonly ethService: EthService) {
    super(ethService)
  }
}

@Controller('eth/erc20')
export class EthErc20Controller extends EvmErc20Controller {
  constructor(private readonly ethErc20Service: EthErc20Service) {
    super(ethErc20Service)
  }
}

@Controller('eth/erc721')
export class EthErc721Controller extends EvmErc721Controller {
  constructor(private readonly ethErc20Service: EthErc721Service) {
    super(ethErc20Service)
  }
}

@Controller('eth/erc1155')
export class EthErc1155Controller extends EvmErc1155Controller {
  constructor(private readonly ethErc1155Service: EthErc1155Service) {
    super(ethErc1155Service)
  }
}
