import { type TokenBalance } from './wallet'

export class WalletContent {
  public balances: TokenBalance[]

  constructor (balances: TokenBalance[]) {
    this.balances = balances
  }

  findInBalance = (
    earnedTokenAddress: string
  ): number =>
    this.balances.find(balance =>
      balance.address.toLowerCase() === earnedTokenAddress)?.balance ?? 0

  merge (balances2: WalletContent) {
    this.balances = this.balances.concat(balances2.balances)
  }
}
