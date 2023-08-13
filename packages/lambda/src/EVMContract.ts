import { ethers, type Signer } from 'ethers'

export class EVMContract {
  contract: ethers.Contract
  protected signer: Signer

  constructor (signer: Signer, contractAddress: string, contractABI: string[]) {
    this.contract = new ethers.Contract(contractAddress, contractABI, signer)
    this.signer = signer
  }

  callWithGas = async <T extends any[]>(
    methodName: string,
    ...args: T
  ): Promise<any> =>
    this.contract[methodName].bind(this.contract)(...args, {
      // @ts-expect-error
      gasPrice: await this.signer.provider.getGasPrice(),
      gasLimit: (await this.contract.estimateGas[methodName](...args)).mul(12).div(10)
    }).wait()
}
