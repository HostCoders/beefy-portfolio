import axios from 'axios'
import { BigNumber, type Signer } from 'ethers'
import { type TransactionRequest } from '@ethersproject/abstract-provider/src.ts'
import { ERC20Contract } from '../ERC20Contract'

const nativeToken = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const routeURL = '/api/v1/routes'
const routeURL2 = '/api/v1/route/build'

const server = 'https://aggregator-api.kyberswap.com/'

export class Kyberswap {
  constructor (private readonly chain: string) {

  }

  async swap (src: string, dst: string, from: string, amount: string, slippage: number, signer: Signer) {
    console.log('swap', src, dst, from, amount, slippage)

    const route = await this.findRoute(src, dst, amount)
    console.log('route', route)
    route.recipient = from
    route.slippageTolerance = 0
    route.sender = from
    const tx = await this.getRouterTransaction(route)
    const allowed = await new ERC20Contract(signer, src).allowance(from, tx.routerAddress)

    if (allowed.lt(BigNumber.from(amount))) {
      const resApprove = await new ERC20Contract(signer, src).approve(tx.routerAddress, BigNumber.from(amount))
      console.log(resApprove)
    }

    console.log('tx', tx)
    // delete tx.gas
    //  const gasLimit = await signer.estimateGas(sendTransactionOption)

    // TODO reintroduce gaslimit ?

    const sendTransactionOption: TransactionRequest = {
      from,
      to: tx.routerAddress,
      data: tx.data,

      // @ts-expect-error
      gasPrice: await signer.provider.getGasPrice()
      //  gasLimit: gasLimit.mul(1.2)

    }

    const res2 = await signer.sendTransaction(sendTransactionOption)
    console.log(res2.hash)
  }

  sleep = async () => await new Promise(resolve => setTimeout(resolve, 1000))
  findRoute = async (tokenIn: string, tokenOut: string, amountIn: string) => {
    try {
      return (await axios.get(server + this.chain + routeURL, {
        params: {
          tokenIn,
          tokenOut,
          amountIn
          // gasIncluded: true
        }
      })).data.data
    } catch (error) {
      // @ts-expect-error
      throw new Error(error.message())
    }
  }

  getRouterTransaction = async (path: string) => {
    try {
      return (await axios.post(server + this.chain + routeURL2, path)).data.data
    } catch (error) {
      // @ts-expect-error
      throw new Error(error.message())
    }
  }

  isTokenSupported = async (token: string) =>
    await this.findRoute(token, nativeToken, '10000000').then(() => true).catch(() => false)
}
