import { type BigNumber, type Signer } from 'ethers'
import { EVMContract } from './EVMContract'

export class ERC20Contract extends EVMContract {
  constructor (signer: Signer, contractAddress: string) {
    const contractABI = [
      'function totalSupply() external view returns (uint256)',
      'function balanceOf(address account) external view returns (uint256)',
      'function transfer(address recipient, uint256 amount) external returns (bool)',
      'function allowance(address owner, address spender) external view returns (uint256)',
      'function approve(address spender, uint256 amount) external returns (bool)',
      'function transferFrom(address sender,address recipient,uint256 amount) external returns (bool)']

    super(signer, contractAddress, contractABI)
  }

  totalSupply = async (): Promise<string> => this.contract.totalSupply()

  balanceOf = async (account: string) => this.contract.balanceOf(account)

  transfer = async (recipient: string, amount: string) =>
    await this.callWithGas('transfer', recipient, amount)

  allowance = async (owner: string, spender: string) => this.contract.allowance(owner, spender)

  approve = async (spender: string, amount: BigNumber) =>
    await this.callWithGas('approve', spender, amount)

  transferFrom = async (sender: string, recipient: string, amount: string) =>
    await this.callWithGas('transferFrom', sender, recipient, amount)
}
