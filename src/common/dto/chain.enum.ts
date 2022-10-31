export enum Chain {
  ETH = 'ETH',
  BTC = 'BTC',
  TRON = 'TRON',
  MATIC = 'MATIC',
  SOL = 'SOL',
}

export type EvmChain = Chain.ETH | Chain.MATIC
