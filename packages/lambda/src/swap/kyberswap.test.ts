import { Kyberswap } from './kyberswap'

describe('kyberswap', () => {
  let instance: Kyberswap

  beforeEach(() => {
    // eslint-disable-next-line new-cap
    instance = new Kyberswap('polygon')
  })

  describe('swap', () => {
    it('should call the findRoute API and return data', async () => {
      // eslint-disable-next-line no-secrets/no-secrets
      const tokenIn = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
      // eslint-disable-next-line no-secrets/no-secrets
      const tokenOut = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
      const amountIn = '10000000000'

      const result = await instance.findRoute(tokenIn, tokenOut, amountIn)

      // Depending on the actual API return, you'll want to adjust this check.
      // Here, we're simply checking if there's a data attribute in the response.
      expect(result).toHaveProperty('routeSummary')

      // (Optional) Additional checks on data content
      // e.g., expect(result.data.someAttribute).toBe('expectedValue');
    })
  })

  // Optionally, you can also add an afterAll or afterEach to clean up any potential
  // side-effects that might be caused by your tests (e.g., deleting test data).
})
