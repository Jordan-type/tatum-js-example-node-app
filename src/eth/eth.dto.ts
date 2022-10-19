import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator'
import { Transform } from 'class-transformer'

export class GenerateAddressQuery {
  @IsNotEmpty()
  @IsString()
  public xpub: string
  @IsNotEmpty()
  @Min(0)
  @IsNumber()
  @Transform((v) => Number(v.value))
  public index: number
}
