import { type Signer } from 'ethers'
import { OneInchV5, type TokenDto } from './1inch-v5'

export class Swap1Inch {
  signer: Signer
  // eslint-disable-next-line no-secrets/no-secrets
  authorization = 'Bearer wxrELgcvgqhUpFzNUfkXzjvbR3Dk7hG0'
  tokenList: Record<string, TokenDto> = {}
  private readonly chainID: number = 0

  constructor (signer: Signer, chain: string) {
    if (chain === 'polygon') {
      this.chainID = 137
    } else
      if (chain === 'bsc') {
        this.chainID = 56
      }
    this.signer = signer
  }

  async swap (src: string, dst: string, from: string, amount: string, slippage: number) {
    await this.checkHealth()

    if (await this.findToken(src) === undefined || await this.findToken(dst) === undefined) {
      throw new Error('srcToken or dstToken not available for findRoute')
    }

    const allowance: number = await this.checkAllowance(this.chainID, src, from)

    if (allowance < parseInt(amount)) {
      const approvalTransaction = await this.getApprovalTransaction(this.chainID, src, amount)
      console.log(approvalTransaction)
      const res = await this.signer.sendTransaction(approvalTransaction)
      console.log(res.hash)
    }

    const swapTransaction = await this.createSwapTransaction(this.chainID, src, dst, from, amount, slippage)
    console.log(swapTransaction.toAmount)
    // @ts-expect-error
    delete swapTransaction.tx.gas
    const res2 = await this.signer.sendTransaction(swapTransaction.tx)
    console.log(res2.hash)
  }

  async sleep () {
    return await new Promise(resolve => setTimeout(resolve, 1000))
  };

  public readonly findToken = async (src: string) => {
    if (Object.keys(this.tokenList).length === 0) {
      await this.initTokenList()
    }
    return this.tokenList[src.toLowerCase()]
  }

  private async initTokenList () {
    // @ts-expect-error
    this.tokenList = await this.getSwappableTokenList(this.chainID)
  }

  private async checkAllowance (chainID: number, tokenAddress: string, walletAddress: string): Promise<number> {
    const oneInchV5 = new OneInchV5()
    await this.sleep()

    const res = await oneInchV5.v52.chainApproveControllerGetAllowance(chainID, {
      tokenAddress,
      walletAddress
    },
    {
      headers: {
        Authorization: this.authorization
      },
      baseURL: 'https://api.1inch.dev/swap'
    })
    if (res.status !== 200) {
      throw new Error('1inch api not available')
    }

    // @ts-expect-error
    const result: number = res.data.allowance
    return result
  }

  private async checkHealth () {
    await this.sleep()
    const oneInchV5 = new OneInchV5()
    const res = await oneInchV5.v52.factoryHealthCheckControllerHealthcheck(1, {
      headers: {
        Authorization: this.authorization
      },
      baseURL: 'https://api.1inch.dev/swap'
    })
    if (res.status !== 200) {
      throw new Error('1inch api not available')
    }
  }

  private async getSwappableTokenList (chainID: number) {
    await this.sleep()

    const oneInchV5 = new OneInchV5()
    const res = await oneInchV5.v52.chainTokensControllerGetTokens(chainID, {
      headers: {
        Authorization: this.authorization
      },
      baseURL: 'https://api.1inch.dev/swap'
    })
    if (res.status !== 200) {
      throw new Error('1inch api not available')
    }
    return (res.data.tokens)
  }

  private async getApprovalTransaction (chainID: number, tokenAddress: string, amount: string) {
    await this.sleep()
    const oneInchV5 = new OneInchV5()
    const res = await oneInchV5.v52.chainApproveControllerGetCallData(chainID, {
      tokenAddress,
      amount
    }, {
      headers: {
        Authorization: this.authorization
      },
      baseURL: 'https://api.1inch.dev/swap'
    })
    if (res.status !== 200) {
      throw new Error('1inch api not available')
    }
    return (res.data)
  }

  private async createSwapTransaction (chainID: number, src: string, dst: string, from: string, amount: string, slippage: number) {
    await this.sleep()
    const oneInchV5 = new OneInchV5()
    const query = {
      src,
      dst,
      from,
      amount,
      slippage
    }
    const res = await oneInchV5.v52.exchangeControllerGetSwap(chainID, query, {
      headers: {
        Authorization: this.authorization
      },
      baseURL: 'https://api.1inch.dev/swap'
    })
    if (res.status !== 200) {
      throw new Error('1inch api not available')
    }
    return (res.data)
  }
}

// eslint-disable-next-line no-secrets/no-secrets
/*

 const query = {
            src: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            dst: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            from: '0xe6a1d739422166880d689330be5cf17a7112709d',
            amount: '100000000000',
            slippage: 1
        };

const { providers, BigNumber, Wallet } = require('ethers')
const provider = new providers.InfuraProvider('YOUR_INFURA_PROJECT_ID')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)

const fromTokenAddress = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
const toTokenAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // ETH
const amount = '100' // Amount of USDC to findRoute

const quote = await oneInch.getQuote(provider, fromTokenAddress, toTokenAddress, amount)
const toTokenAmount = quote.toTokenAmount

const txData = await oneInch.createSwapTransaction(provider, wallet, fromTokenAddress, toTokenAddress, amount, toTokenAmount)

const txHash = await provider.sendTransaction(txData)

console.log('Transaction hash:', txHash) */
