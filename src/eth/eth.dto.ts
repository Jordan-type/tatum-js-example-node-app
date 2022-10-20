import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { Transform } from 'class-transformer'

export class MnemonicDto {
  @IsString()
  @IsOptional()
  public mnemonic: string
}

export class GenerateWalletDto extends MnemonicDto {}

export class GeneratePrivateKeyDto extends MnemonicDto {
  @IsNotEmpty()
  @Min(0)
  @IsNumber()
  @Transform((v) => Number(v.value))
  public index: number
}

export class GenerateAddressDto {
  @IsNotEmpty()
  @IsString()
  public xpub: string

  @IsNotEmpty()
  @Min(0)
  @IsNumber()
  @Transform((v) => Number(v.value))
  public index: number
}

export class GetBlockDto {
  @IsNotEmpty()
  @IsString()
  public hashOrNumber: string
}

export class GetTransactionDto {
  @IsNotEmpty()
  @IsString()
  public hash: string
}

export class GetBalanceDto {
  @IsNotEmpty()
  @IsString()
  public address: string
}
