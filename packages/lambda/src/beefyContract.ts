import { type Signer } from 'ethers'
import { EVMContract } from './EVMContract'

export class BeefyContract extends EVMContract {
  constructor (signer: Signer, contractAddress: string) {
    const contractABI = ['function depositAll() external', 'function withdrawAll() external']

    super(signer, contractAddress, contractABI)
  }

  depositAll = async () => await this.callWithGas('depositAll')
  withdrawAll = async () => await this.callWithGas('withdrawAll')
}
