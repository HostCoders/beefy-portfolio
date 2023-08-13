import { TokenInfoRetriever } from './coingecko'

describe('TokenInfoRetriever', () => {
  let client: TokenInfoRetriever

  beforeEach(() => {
    client = new TokenInfoRetriever()
  })

  it('should fetch price and decimals for USDC on Polygon', async () => {
    // eslint-disable-next-line no-secrets/no-secrets
    const usdcAddressOnPolygon = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'

    const result = await client.getPriceInUSDAndDecimals('polygon', usdcAddressOnPolygon)

    // We cannot predict the exact price, but we know it should be a number
    expect(typeof result.price).toBe('number')

    // For USDC, we know decimals should be 6
    expect(result.decimals).toBe(6)
  })

  it('should throw an error for unknown token', async () => {
    const unknownTokenAddress = '0xunknownTokenAddress'

    // We're expecting an error to be thrown, so we catch it with a try/catch block
    try {
      await client.getPriceInUSDAndDecimals('optimism', unknownTokenAddress)
    } catch (error: any) {
      // We expect the error message to match a specific format
      expect(error?.message).toContain('Request failed with status code 404')
    }
  })
})
