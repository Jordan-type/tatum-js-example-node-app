import { TatumEthSDK } from '@tatumio/eth'
import { TatumPolygonSDK } from '@tatumio/polygon'

export abstract class EvmSdkService {
  public abstract getSdk(): ReturnType<typeof TatumEthSDK | typeof TatumPolygonSDK>
}
