import { Controller } from '@nestjs/common'
import { EvmAddressController } from '../evm/evm.address.controller'
import { PolygonService } from './polygon.serivce'
import { EvmBlockController } from '../evm/evm.block.controller'
import { EvmTransactionController } from '../evm/evm.transaction.controller'
import { EvmWalletController } from '../evm/evm.wallet.controller'
import { EvmErc20Controller } from '../evm/erc20/evm.erc20.controller'
import { EvmErc721Controller } from '../evm/erc721/evm.erc721.controller'
import { EvmErc1155Controller } from '../evm/erc1155/evm.erc1155.controller'
import { PolygonErc1155Service, PolygonErc20Service, PolygonErc721Service } from './polygon.contract.service'

@Controller('polygon/address')
export class PolygonAddressController extends EvmAddressController {
  constructor(private readonly polygonService: PolygonService) {
    super(polygonService)
  }
}

@Controller('polygon/block')
export class PolygonBlockController extends EvmBlockController {
  constructor(private readonly polygonService: PolygonService) {
    super(polygonService)
  }
}

@Controller('polygon/transaction')
export class PolygonTransactionController extends EvmTransactionController {
  constructor(private readonly polygonService: PolygonService) {
    super(polygonService)
  }
}

@Controller('polygon/wallet')
export class PolygonWalletController extends EvmWalletController {
  constructor(readonly polygonService: PolygonService) {
    super(polygonService)
  }
}

@Controller('polygon/erc20')
export class PolygonErc20Controller extends EvmErc20Controller {
  constructor(private readonly polygonErc20Service: PolygonErc20Service) {
    super(polygonErc20Service)
  }
}

@Controller('polygon/erc721')
export class PolygonErc721Controller extends EvmErc721Controller {
  constructor(private readonly polygonErc721Service: PolygonErc721Service) {
    super(polygonErc721Service)
  }
}

@Controller('polygon/erc1155')
export class PolygonErc1155Controller extends EvmErc1155Controller {
  constructor(private readonly polygonErc1155Service: PolygonErc1155Service) {
    super(polygonErc1155Service)
  }
}
