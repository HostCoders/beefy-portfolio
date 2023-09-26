import { OneInchV5 } from './1inch-v5'

describe('test 1inch v5', () => {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async function sleep () {
    return await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // eslint-disable-next-line no-secrets/no-secrets
  const authorization = 'Bearer wxrELgcvgqhUpFzNUfkXzjvbR3Dk7hG0'
  // eslint-disable-next-line no-secrets/no-secrets
  const tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  // eslint-disable-next-line no-secrets/no-secrets
  const walletAddress = '0xe6a1d739422166880d689330be5cf17a7112709d'

  it('should have good health', async () => {
    await sleep()
    const oneInchV5 = new OneInchV5()
    const res = await oneInchV5.v52.factoryHealthCheckControllerHealthcheck(1, {
      headers: {
        Authorization: authorization
      },
      baseURL: 'https://api.1inch.dev/swap'
    })
    expect(res.status).toBe(200)
  })

  it('should have liquidity sources', async () => {
    await sleep()

    const oneInchV5 = new OneInchV5()
    const res = await oneInchV5.v52.chainTokensControllerGetTokens(1, {
      headers: {
        Authorization: authorization
      },
      baseURL: 'https://api.1inch.dev/swap'
    })
    expect(res.status).toBe(200)
    console.table(res.data.tokens)
  })

  it('should check allowance', async () => {
    await sleep()

    const oneInchV5 = new OneInchV5()
    const res = await oneInchV5.v52.chainApproveControllerGetAllowance(1, {
      // eslint-disable-next-line no-secrets/no-secrets
      tokenAddress,
      // eslint-disable-next-line no-secrets/no-secrets
      walletAddress
    },
    {
      headers: {
        // eslint-disable-next-line no-secrets/no-secrets
        Authorization: authorization
      },
      baseURL: 'https://api.1inch.dev/swap'
    })
    expect(res.status).toBe(200)
    console.table(res.data)
  })

  it('should have spender address', async () => {
    await sleep()
    const oneInchV5 = new OneInchV5()
    const res = await oneInchV5.v52.chainApproveControllerGetSpender(1, {
      headers: {
        // eslint-disable-next-line no-secrets/no-secrets
        Authorization: authorization
      },
      baseURL: 'https://api.1inch.dev/swap'
    })
    expect(res.status).toBe(200)
    console.table(res.data.address)
  })

  it('should create approval transaction', async () => {
    await sleep()
    const oneInchV5 = new OneInchV5()
    const res = await oneInchV5.v52.chainApproveControllerGetCallData(1, {
      // eslint-disable-next-line no-secrets/no-secrets
      tokenAddress,
      amount: '10000000000000000'
    }, {
      headers: {
        // eslint-disable-next-line no-secrets/no-secrets
        Authorization: authorization
      },
      baseURL: 'https://api.1inch.dev/swap'
    })
    expect(res.status).toBe(200)
    console.table(res.data)
  })

  it('should create findRoute transaction', async () => {
    // eslint-disable-next-line no-secrets/no-secrets
    /* await sleep();
        let oneInchV5 = new OneInchV5();
        let query = {
            src: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            dst: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            from: '0xe6a1d739422166880d689330be5cf17a7112709d',
            amount: '100000000000',
            slippage: 1
        };
        const res = await oneInchV5.v52.exchangeControllerGetSwap(1, query,{
            headers: {
                Authorization: 'Bearer wxrELgcvgqhUpFzNUfkXzjvbR3Dk7hG0',
            }, baseURL: 'https://api.1inch.dev/swap'
        });
        expect(res.status).toBe(200);
        console.table(res.data) */
  })
})
