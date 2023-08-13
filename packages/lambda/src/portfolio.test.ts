// import {strict as assert} from 'assert';
// import {deepStrictEqual} from 'assert';

// Jest tests

/*
const supportedPlatform: PlatformList = {
  wallet: new Platform('', '', undefined)
} */

/* describe('Portfolio', () => {
  /* test('should throw error if no assets are provided', () => {
    expect(() => new Portfolio([])).toThrow()
  })

  test('should throw error if AssetId names are not unique', () => {
    expect(() => new Portfolio(new Assets([
      { id: 'id1', name: 'Crypto1', apy: 20, risk: 30, price: 100, current: 1 },
      { id: 'id2', name: 'Crypto1', apy: 30, risk: 50, price: 150, current: 1 }
    ], supportedPlatform))).toThrow()
  })

  test('should throw error if any AssetId has negative apy', () => {
    expect(() => new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: -20, risk: 30, price: 100, current: 1 },
      { id: 'id2', name: 'Crypto2', apy: 30, risk: 50, price: 150, current: 1 }
    ])).toThrow()
  })

  test('should throw error if any AssetId has negative risk', () => {
    expect(() => new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: 20, risk: -30, price: 100, current: 1 },
      { id: 'id2', name: 'Crypto2', apy: 30, risk: 50, price: 150, current: 1 }
    ])).toThrow()
  })

  test('should throw error if any AssetId has zero price', () => {
    expect(() => new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: 20, risk: 30, price: 0, current: 1 },
      { id: 'id2', name: 'Crypto2', apy: 30, risk: 50, price: 150, current: 1 }
    ])).toThrow()
  })

  test('should throw error if any AssetId has negative current quantity', () => {
    expect(() => new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: 20, risk: 30, price: 100, current: -1 },
      { id: 'id2', name: 'Crypto2', apy: 30, risk: 50, price: 150, current: 1 }
    ])).toThrow()
  })

  test('should calculate total portfolio value correctly', () => {
    const portfolio = new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: 20, risk: 30, price: 100, current: 1 },
      { id: 'id2', name: 'Crypto2', apy: 30, risk: 50, price: 150, current: 1 }
    ])
    expect(portfolio.getTotalValue()).toBe(250) // 100 + 150
  })

  test('should calculate total portfolio risk correctly', () => {
    const portfolio = new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: 20, risk: 30, price: 100, current: 1 },
      { id: 'id2', name: 'Crypto2', apy: 30, risk: 50, price: 150, current: 1 }
    ])
    expect(portfolio.getTotalRisk()).toBe(42)
  })
*/
// test('should calculate total portfolio apy correctly', () => {
//   const portfolio = new Portfolio([
//     { id: 'id1', name: 'Crypto1', apy: 20, risk: 30, price: 100, current: 1 },
//     { id: 'id2', name: 'Crypto2', apy: 30, risk: 50, price: 150, current: 1 }
//  ])

/*

        The total apy of a portfolio is calculated as a weighted average of the returns of each AssetId, where the weight of an AssetId is its proportion of the total portfolio value.

        Here are the steps to calculate the total apy for the provided portfolio:

        1. Calculate the total value of the portfolio:
            - The value of Crypto1 is 1 * 100 = $100
            - The value of Crypto2 is 1 * 150 = $150
            - Total portfolio value is $100 + $150 = $250

        2. Calculate the weighted apy of each AssetId:
            - The weighted apy of Crypto1 is 20% * ($100 / $250) = 8%
            - The weighted apy of Crypto2 is 30% * ($150 / $250) = 18%

        3. Sum up the weighted returns to get the total apy:
            - Total apy is 8% + 18% = 26%

        So, for the provided portfolio, the total apy is 26%.

         */
//   expect(portfolio.getTotalReturn()).toBe(26)
//  })

// Additional tests for negative risk, zero price, and negative current quantity can be added here.

// eslint-disable-next-line no-secrets/no-secrets
/* test('should not balance if new portfolio does not improve apy by minimum percentage', () => {
    const portfolio = new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: 20, risk: 30, price: 100, current: 1 },
      { id: 'id2', name: 'Crypto2', apy: 30, risk: 50, price: 150, current: 1 }
    ])
    const orders = portfolio.balance(100).orders
    expect(orders).toHaveLength(0)
  })

  test('should balance if new portfolio improves apy by minimum percentage', () => {
    const portfolio = new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: 20, risk: 30, price: 100, current: 3 },
      { id: 'id2', name: 'Crypto2', apy: 50, risk: 50, price: 150, current: 1 }
    ])
    const orders = portfolio.balance(1).orders
    expect(orders).toHaveLength(2)
  })

  test('should not balance if new portfolio does not improve apy by minimum percentage', () => {
    const portfolio = new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: 20, risk: 30, price: 100, current: 3 },
      { id: 'id2', name: 'Crypto2', apy: 50, risk: 50, price: 150, current: 1 }
    ])
    const orders = portfolio.balance(100).orders
    expect(orders).toHaveLength(0)
  })

  test('check all totals', () => {
    const portfolio = new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: 20, risk: 30, price: 100, current: 3 },
      { id: 'id2', name: 'Crypto2', apy: 50, risk: 50, price: 150, current: 1 }
    ])
    expect(portfolio.getTotalValue()).toBe(450)
    expect(portfolio.getTotalRisk()).toBe(36.666666666666664)
    expect(portfolio.getTotalReturn()).toBe(30)
  })

  // Test for display method - since this function only logs to the console, we just want to check that it runs without errors.
  test('should display portfolio without error', () => {
    const portfolio = new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: 20, risk: 30, price: 100, current: 1 },
      { id: 'id2', name: 'Crypto2', apy: 30, risk: 50, price: 150, current: 1 }
    ])
    expect(() => { portfolio.display() }).not.toThrow()
  })

  // Test with one AssetId only.
  test('should work with a single AssetId', () => {
    const portfolio = new Portfolio([
      { id: 'id2', name: 'Crypto1', apy: 20, risk: 30, price: 100, current: 1 }
    ])
    expect(portfolio.getTotalValue()).toBe(100)
    expect(portfolio.getTotalRisk()).toBe(30)
    expect(portfolio.getTotalReturn()).toBe(20)
    expect(portfolio.balance(1).orders).toHaveLength(0)
  })

  // Test balance with a change in AssetId price.
  test('should balance with a change in AssetId price', () => {
    const portfolio = new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: 20, risk: 50, price: 100, current: 1 },
      { id: 'id2', name: 'Crypto2', apy: 50, risk: 50, price: 200, current: 1 }
    ])
    const orders = portfolio.balance(0).orders
    expect(orders).toHaveLength(2)
  })

  // Test balance with a very small minimum percent difference.
  test('should balance with a very small minimum percent difference', () => {
    const portfolio = new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: 20, risk: 50, price: 100, current: 1 },
      { id: 'id2', name: 'Crypto2', apy: 50, risk: 50, price: 150, current: 1 }
    ])
    const orders = portfolio.balance(0.0001).orders
    expect(orders).toHaveLength(2)
  })

  // Test balance with a very small minimum percent difference.
  test('should balance with a new assets with zero apy', () => {
    const portfolio = new Portfolio([
      { id: 'id1', name: 'Crypto1', apy: 0, risk: 50, price: 100, current: 1 },
      { id: 'id2', name: 'Crypto2', apy: 50, risk: 50, price: 100, current: 1 },
      { id: 'id3', name: 'Crypto3', apy: 50, risk: 50, price: 200, current: 1 },
      { id: 'id4', name: 'Crypto4', apy: 50, risk: 100, price: 150, current: 1 }
    ])
    const orders = portfolio.balance(0.0001).orders
    expect(orders).toHaveLength(4)
  })

  describe('disableAsset', () => {
    const assets: Asset[] = [
      {
        name: 'Asset1',
        apy: 10,
        risk: 5,
        price: 20,
        current: 2,
        id: '1'
      },
      {
        name: 'Asset2',
        apy: 8,
        risk: 4,
        price: 15,
        current: 5,
        id: '2'
      }
    ]

    const portfolio = new Portfolio(assets)

    it('should set risk to MAX_SAFE_INTEGER for the specified asset', () => {
      portfolio.disableAsset('1')
      const asset = portfolio.assets.find(asset => asset.id === '1')
      expect(asset).not.toBeNull()
      if (asset !== undefined) expect(asset.risk).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should do nothing if the asset is not found', () => {
      const t = () => {
        portfolio.disableAsset('nonexistent')
      }
      expect(t).not.toThrow()
    })
  })
}) */
