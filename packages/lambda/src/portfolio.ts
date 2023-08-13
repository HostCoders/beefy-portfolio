import { strict as assert } from 'assert'
import { type Assets } from './assets'
import { OrderBook } from './orderBook'

export interface Asset {
  name: string
  apy: number // Expected apy (%)
  risk: number // Risk (%)
  price: number // Price (USD)
  current: number // Current quantity
  id: string
  disabled?: string[]
}

export enum OrderType {
  Buy,
  Sell
}

export interface Order {
  type: OrderType
  AssetId: string
  amount: number
  value: number
}

export class Portfolio {
  private readonly assets: Assets
  private readonly emptyOrderBook = new OrderBook(0, 0, [])

  constructor (assets: Assets) {
    assert(assets.length() > 0, 'You must provide at least one Asset.')
    this.assets = assets.filterOutAssetsWithNoPositionOrIssues()
    this.assets.disableAssetsWithIssue()
  }

  display = (): void => {
    console.log('Portfolio:')
    this.assets.display()

    console.log(`Total Portfolio Value: $${this.assets.value().toFixed(2)}`)
    console.log(`Total Portfolio Return: ${this.assets.apy().toFixed(2)}%`)
    console.log(`Total Portfolio Risk: ${this.assets.risk().toFixed(2)}`)
  }

  balance = (minAPYDelta: number): OrderBook => {
    assert(minAPYDelta >= 0, 'Minimum percent difference must be non-negative.')
    assert(this.assets.ratio() !== 0, 'The sum of the ratios of apy to risk for all assets must not be zero.')

    const optimal: Assets = this.assets.optimalAllocation(this.assets.value(), this.assets.ratio())

    if (optimal.apy() <= this.assets.apy() + minAPYDelta) return this.emptyOrderBook

    return new OrderBook(optimal.risk(), optimal.apy(),
      this.assets.createOrders(optimal))
  }
}
