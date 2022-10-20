export class GeneratedWalletDto {
  public mnemonic: string
  public xpub: string
  public addresses: GeneratedWalletAddressKeyDto[]
}

export class GeneratedWalletAddressKeyDto {
  public address: string
  public privateKey: string
  public index: number
}
