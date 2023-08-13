import { type ethers, type Signer } from 'ethers'
import { EVMContract } from './EVMContract'

export class VelodromeContract extends EVMContract {
  constructor (signer: Signer, contractAddress: string) {
    const contractABI = [
      'function addLiquidity(address tokenA,address tokenB,bool stable,uint256 amountADesired,uint256 amountBDesired,uint256 amountAMin,uint256 amountBMin,address to,uint256 deadline) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
      'function quoteAddLiquidity(address tokenA,address tokenB,bool stable,address _factory,uint256 amountADesired,uint256 amountBDesired) external view returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
      'function defaultFactory() external view returns (address)',
      'function quoteStableLiquidityRatio(address tokenA, address tokenB, address _factory) external view returns (uint256 ratio)',
      'function removeLiquidity(address tokenA, address tokenB, bool stable, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB)'
    ]

    super(signer, contractAddress, contractABI)
  }

  removeLiquidity = async (
    tokenA: string,
    tokenB: string,
    stable: boolean,
    liquidity: ethers.BigNumber,
    amountAMin: ethers.BigNumber,
    amountBMin: ethers.BigNumber,
    to: string,
    deadline: ethers.BigNumber
  ) => await this.callWithGas('removeLiquidity', tokenA,
    tokenB,
    stable,
    liquidity,
    amountAMin,
    amountBMin,
    to,
    deadline)

  addLiquidity = async (tokenA: string,
    tokenB: string,
    stable: boolean,
    amountADesired: ethers.BigNumber,
    amountBDesired: ethers.BigNumber,
    amountAMin: ethers.BigNumber,
    amountBMin: ethers.BigNumber,
    to: string,
    deadline: ethers.BigNumber) =>
    await this.callWithGas('addLiquidity', tokenA, tokenB, stable, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline)

  async quoteAddLiquidity (
    tokenA: string,
    tokenB: string,
    stable: boolean,
    amountADesired: ethers.BigNumber,
    amountBDesired: ethers.BigNumber
  ): Promise<{ amountA: ethers.BigNumber, amountB: ethers.BigNumber, liquidity: ethers.BigNumber }> {
    const result = await this.contract.quoteAddLiquidity(
      tokenA,
      tokenB,
      stable,
      await this.defaultFactory(),
      amountADesired,
      amountBDesired)
    return {
      amountA: result[0],
      amountB: result[1],
      liquidity: result[2]
    }
  }

  quoteStableLiquidityRatio = async (
    tokenA: string,
    tokenB: string
  ): Promise<ethers.BigNumber> => this.contract.quoteStableLiquidityRatio(
    tokenA,
    tokenB,
    await this.defaultFactory())

  defaultFactory = async (): Promise<string> => this.contract.defaultFactory()
}
