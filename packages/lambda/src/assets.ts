import BeefyApiClient, {
  type LPBreakdownsResponse,
  type Token,
  type TokensList,
  type TvlResponse,
  type Vault
} from './beefy'
import { type Order, OrderType } from './portfolio'
import { type PlatformList } from './platform'
import { type TokenInfoRetriever } from './coingecko'
import { type WalletContent } from './walletContent'
import { Swap } from './swap'
import { type Signer } from 'ethers'

export type AssetPresenceCondition = (asset1Present: boolean, asset2Present: boolean) => boolean

export class Assets {
  FOUR_DAYS_IN_SECONDS = 172800 * 2
  ZERO_RISK = 1e-20
  private vaults: Vault[]
  private readonly supportedPlatform: PlatformList

  constructor (vaults: Vault[], supportedPlatform: PlatformList) {
    //    this.validateVaults(vaults);
    this.vaults = vaults
    this.supportedPlatform = supportedPlatform
  }

  /* private validateVaults(vaults: Vault[]): void {
         assert(new Set(vaults.map(v => v.id)).size === vaults.length, "Asset names must be unique");
         for (const asset of vaults) {
             assert(asset.apy >= 0, `Return for asset ${asset.name} must be non-negative.`);
             assert(asset.risk >= 0, `Risk for asset ${asset.name} must be non-negative.`);
             assert(asset.price > 0, `Price for asset ${asset.name} must be greater than zero.`);
             assert(asset.current >= 0, `Current quantity for asset ${asset.name} must be non-negative.`);
         }
     } */

  public length = () => this.vaults.length

  public apy = () =>
    this.vaults.reduce((sum, asset) => sum + (asset.current * asset.price * asset.apy) / this.value(), 0)

  public value = () => this.vaults.reduce((total, asset) => total + asset.price * asset.current, 0)

  // Method to get the total risk of the portfolio (weighted average risk of all assets)
  public risk = () =>
  // Calculate total risk, which is the sum of the risk of each AssetId, weighted by its value.
    this.vaults.reduce((total, asset) => total + asset.risk * asset.price * asset.current, 0) / this.value()

  public ratio = () => this.vaults.reduce((sum, asset) => sum + asset.apy / asset.risk, 0)

  public optimalAllocation = (totalPortfolioValue: number, totalRatio: number) =>
    new Assets(
      this.vaults.map(
        asset => ({
          ...asset,
          current: (totalPortfolioValue * asset.apy) / asset.risk / (totalRatio * asset.price)
        }),
        this.supportedPlatform
      ),
      this.supportedPlatform
    )

  public createOrders = (endAssets: Assets): Order[] =>
    this.vaults.flatMap((startAsset, i) => ({
      type: startAsset.current - endAssets.vaults[i].current < 0 ? OrderType.Buy : OrderType.Sell,
      AssetId: startAsset.id,
      amount: Math.abs(startAsset.current - endAssets.vaults[i].current),
      value: Math.abs(startAsset.current - endAssets.vaults[i].current) * startAsset.price
    }))

  public disableRiskyOrUnsupported = (supportedPlatform: PlatformList, supportedAssets: string[]) => {
    this.vaults.forEach(vault => {
      if (!vault.disabled) vault.disabled = []
      if (vault.status === 'eol') vault.disabled.push('EOL')
      if (!(vault.platformId.toLowerCase() in supportedPlatform)) vault.disabled.push('UNSUPPORTED_PLATFORM')
      if (vault.lastHarvest < new Date().getTime() / 1000 - this.FOUR_DAYS_IN_SECONDS) { vault.disabled.push('NO_HARVEST_IN_4_DAYS') }
      if (vault.status !== 'active') vault.disabled.push('INACTIVE')
      if (vault.oracle !== 'lps') vault.disabled.push('NOT_LIVE_PRICE_ORACLE')
      if (!vault.assets.every(asset => supportedAssets.includes(asset.toUpperCase()))) { vault.disabled.push('UNSUPPORTED_ASSET') }
      if (vault.tokenDecimals !== 18) vault.disabled.push('UNSUPPORTED_DECIMALS')
    })
  }

  public disableVaultWithTVLTooLow = () => { this.vaults.filter(vault => vault.tvl <= 10000).forEach(vault => vault.disabled.push('TVL_TOO_LOW')) }

  public filterOutUnsupportedChains = (chain: string) =>
  // Filter out assets from unsupported chains
    (this.vaults = this.vaults.filter(vault => vault.chain.toUpperCase() === chain.toUpperCase()))

  public enrichVaults = (
    annualPercentYields: TvlResponse,
    beefy: BeefyApiClient,
    liquidityPoolsBreakdowns: LPBreakdownsResponse,
    totalValueLocked: TvlResponse,
    chain: string,
    tokens: TokensList,
    liquidityPools: TvlResponse,
    walletBalances: WalletContent
  ) =>
  // Map over the assets to add the TVL to each vault
    (this.vaults = this.vaults.map(vault => ({
      ...vault,
      apy: 100 * annualPercentYields[vault.id] || 0,
      tvl: beefy.findTVL(vault.id, totalValueLocked),
      breakdownPrice: liquidityPoolsBreakdowns[vault.id]?.price,
      breakdownBalances: liquidityPoolsBreakdowns[vault.id]?.balances,
      breakdownTokens: liquidityPoolsBreakdowns[vault.id]?.tokens,
      breakdownTotalSupply: liquidityPoolsBreakdowns[vault.id]?.totalSupply,
      asset1: tokens[chain][vault.assets[0]] || null,
      asset2: tokens[chain][vault.assets[1]] || null,
      asset3: tokens[chain][vault.assets[2]] || null,
      asset4: tokens[chain][vault.assets[3]] || null,
      risk: BeefyApiClient.getRisk(vault),
      price: liquidityPools[vault.oracleId],
      current: walletBalances.findInBalance(vault.tokenAddress),
      platform: this.getVaultPlatform(vault)
    })))

  getMatchedVault = (order: Order) => this.vaults.find(vault => vault.id === order.AssetId)

  filterOutWalletAssets = (sellVaults: Assets) =>
    sellVaults.vaults.filter(vault => vault?.tokenProviderId !== 'wallet')

  getMatchingAssetAddress = (sellVaults: Assets, address: string) =>
    sellVaults.vaults.find(vault => vault.tokenAddress === address)

  addWalletBalancesToVaults = async (
    chain: string,
    walletBalances: WalletContent,
    supportedAssets: string[],
    tokenInfo: TokenInfoRetriever,
    tokens: TokensList
  ) => {
    for (const { address, balance: current, balanceRaw, name, symbol } of walletBalances.balances) {
      // don't add if already in assets addresses

      const findVaultByTokenAddress1 = this.findVaultByEarnedTokenAddress(address)
      if (findVaultByTokenAddress1) {
        // if vault is already in assets, add to current
        findVaultByTokenAddress1.current = current
        findVaultByTokenAddress1.currentRaw = balanceRaw
        continue
      }
      console.log('searching', symbol)

      // if balance token name is supported
      if (!supportedAssets.includes(symbol.toUpperCase())) continue
      console.table(tokens[chain][address])

      try {
        const { decimals, price } = await tokenInfo.getPriceInUSDAndDecimals(chain, address.toLowerCase())

        const balanceVault = {
          name,
          apy: 0,
          risk: this.ZERO_RISK,
          price,
          current,
          currentRaw: balanceRaw,
          id: symbol,
          token: symbol,
          tokenAddress: address,
          tokenDecimals: decimals,
          tokenProviderId: 'wallet',
          earnedToken: '',
          earnedTokenAddress: '',
          earnContractAddress: '',
          oracle: '',
          oracleId: '',
          status: '',
          platformId: '',
          assets: [],
          strategyTypeId: '',
          risks: [],
          createdAt: 0,
          chain,
          strategy: '',
          lastHarvest: 0,
          pricePerFullShare: '',
          tvl: 0,
          return: 0,
          disabled: []
        }
        this.vaults.push(balanceVault)
      } catch (e) {
        console.warn('cannot add balance', symbol)
      }
    }
  }

  findVaultByEarnedTokenAddress = (address: string) =>
    this.vaults.find(vault => vault.earnedTokenAddress?.toLowerCase() === address.toLowerCase())

  findVaultByTokenAddress = (address: string) =>
    this.vaults.find(vault => vault.tokenAddress?.toLowerCase() === address.toLowerCase())

  filterByVaultsByAssetPresence = (sellVaults: Assets, condition: AssetPresenceCondition): Vault[] =>
    this.vaults.filter(currentVault => {
      // Ensure we only process vaults with exactly 2 assets.
      // If there are vaults with different asset numbers, additional logic will be needed.
      if (currentVault.assets.length !== 2) {
        throw new Error('Not Implemented: Vault with more than 2 assets')
      }

      // Check if the sell vaults contain the assets from the current buy vault
      const asset1Present = sellVaults.vaults.some(
        sellVault => sellVault.tokenAddress === (currentVault.asset1?.address ?? '')
      )
      const asset2Present = sellVaults.vaults.some(
        sellVault => sellVault.tokenAddress === (currentVault.asset2?.address ?? '')
      )

      // Return the result of the condition function
      return condition(asset1Present, asset2Present)
    })

  filterOutAssetsWithNoPositionOrIssues = () =>
    new Assets(
      this.vaults.filter(asset => asset.current > 0 || asset.disabled.length === 0),
      this.supportedPlatform
    )

  disableAssetsWithIssue = () =>
    (this.vaults = this.vaults.map(asset =>
      asset.disabled.length > 0
        ? {
            ...asset,
            risk: Number.MAX_SAFE_INTEGER
          }
        : asset
    ))

  display () {
    console.log(' RR ratio : ', this.ratio())
    console.log(' return : ', this.apy())
    console.log(' risk : ', this.risk())
    console.log(' value : ', this.value())

    console.table(this.vaults)
  }

  async swapAssets (signer: Signer, to: Token, keep: Token, amountUSD: number) {
    console.log('swapping', to, keep, amountUSD)
    for (const vault of this.vaults) {
      if (vault.tokenAddress !== keep.address) {
        // TODO we take the first token available, we can do better

        const chainID = 137
        const src = vault.tokenAddress
        const dst = to.address
        const from = await signer.getAddress()
        const amount = '????' // 1 DAI (with 18 decimal places)
        const slippage = 0 // 0 slippage

        await new Swap(signer).swap(chainID, src, dst, from, amount, slippage)
      }
    }
  }

  private readonly getVaultPlatform = (vault: Vault) => this.supportedPlatform[vault.platformId.toLowerCase()]
}
