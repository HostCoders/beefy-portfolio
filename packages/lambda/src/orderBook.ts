import { type Order } from './portfolio'

export class OrderBook {
  newRisk: number
  newReturn: number
  orders: Order[]

  // to cover rounding errors
  private readonly MIN_ORDER_VALUE = 0.0001

  constructor (newRisk: number, newReturn: number, orders: Order[]) {
    this.newRisk = newRisk
    this.newReturn = newReturn
    this.orders = this.filterValidOrders(orders)
  }

  filterValidOrders = (orders: Order[]): Order[] =>
    orders.filter((order) => order.value > this.MIN_ORDER_VALUE)
}
