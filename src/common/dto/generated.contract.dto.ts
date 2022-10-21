export type GeneratedContractDetails = {
  txId: string
  creator: string
}

export type GeneratedContractWithAddress = GeneratedContractDetails & {
  contractAddress: string
}

export type GeneratedContractWithTokenId = GeneratedContractDetails & {
  tokenId: string
}

export type GeneratedContract =
  | GeneratedContractDetails & Partial<GeneratedContractWithAddress> & Partial<GeneratedContractWithTokenId>
