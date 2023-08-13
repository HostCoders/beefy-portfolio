import { BigNumber, ethers, type Signer } from 'ethers'
import { VelodromeContract } from './velodromeContract'
import { PearlContract } from './pearlContract'

export type PlatformList = Record<string, Platform>

export class Platform {
  readonly address: string
  // @ts-expect-error
  private readonly name: string
  private readonly signer: Signer
  private readonly implementation: VelodromeContract | PearlContract

  constructor (name: string, router: string, provider: Signer) {
    this.name = name
    this.address = router
    this.signer = provider

    if (name === 'velodrome') {
      this.implementation = new VelodromeContract(this.signer, this.address)
    } else if (name === 'pearl') {
      this.implementation = new PearlContract(this.signer, this.address)
    } else {
      // by default
      // @ts-expect-error
      this.implementation = null
    }
  }

  public async quoteAddLiquidity (
    tokenA: string,
    tokenB: string,
    amountADesired: ethers.BigNumber,
    amountBDesired: ethers.BigNumber
  ): Promise<{ amountA: ethers.BigNumber, amountB: ethers.BigNumber, liquidity: ethers.BigNumber }> {
    return await this.implementation.quoteAddLiquidity(
      tokenA,
      tokenB,
      true,
      amountADesired,
      amountBDesired)
  }

  public async getLiquidityRatio (tokenA: string, tokenADecimals: number, tokenB: string, tokenBDecimals: number): Promise<BigNumber> {
    const res = await this.quoteAddLiquidity(
      tokenA,
      tokenB,
      ethers.utils.parseUnits('1', tokenADecimals),
      ethers.utils.parseUnits('1', tokenBDecimals)
    )

    const scalingFactor = BigNumber.from(10).pow(tokenBDecimals - tokenADecimals)
    return res.amountB.mul(scalingFactor).div(res.amountA)
  }

  public addLiquidity = async (tokenA: string,
    tokenB: string,
    amountADesired: ethers.BigNumber,
    amountBDesired: ethers.BigNumber,
    amountAMin: ethers.BigNumber,
    amountBMin: ethers.BigNumber,
    to: string,
    deadline: ethers.BigNumber) => await this.implementation.addLiquidity(tokenA, tokenB, true, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline)
}
