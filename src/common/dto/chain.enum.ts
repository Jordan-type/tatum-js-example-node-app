export enum Chain {
  ETH = 'ETH',
  BTC = 'BTC',
  TRON = 'TRON',
  MATIC = 'MATIC',
  SOLANA = 'SOLANA',
}

export type EvmChain = Chain.ETH | Chain.MATIC
