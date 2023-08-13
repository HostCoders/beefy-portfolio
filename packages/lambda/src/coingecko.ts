import axios from 'axios'
import { type CoinFullInfo } from 'coingecko-api-v3/dist/Interface'

interface PriceAndDecimals {
  price: number
  decimals: number
}

export class TokenInfoRetriever {
  constructor (private readonly baseUrl: string = 'https://api.coingecko.com/api/v3') {
  }

  /**
     * Fetches the current price in USD and number of decimals for a token.
     */
  getPriceInUSDAndDecimals = async (chain: string, address: string): Promise<PriceAndDecimals> =>
    await this.getInfo(chain, address)
      .then(res => ({
        price: (res as any).market_data.current_price.usd,
        decimals: (res as any).detail_platforms[this.swapChainNames(chain)].decimal_place
      }))

  /**
     * Maps chain names to their equivalent in the CoinGecko API.
     */
  private readonly swapChainNames = (chain: string): string => ({
    optimism: 'optimistic-ethereum',
    polygon: 'polygon-pos'
  }[chain] ?? chain)

  /**
     * Fetches token information from the CoinGecko API.
     */
  private readonly getInfo = async (chain: string, address: string): Promise<CoinFullInfo> =>
    await axios.get<CoinFullInfo>(`${this.baseUrl}/coins/${this.swapChainNames(chain)}/contract/${address}`)
      .then(response => response.data)
      .catch(error => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Error fetching info for ${chain}:${address}: ${error.message}`)
      })
}
