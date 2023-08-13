import BeefyApiClient, {
  type LPBreakdownsResponse,
  type Token,
  type TokensList,
  type TvlResponse,
  type Vault
} from './beefy'
import { BigNumber, type Signer } from 'ethers'
import { OrderType, Portfolio } from './portfolio'
import { TokenInfoRetriever } from './coingecko'
import { type PlatformList } from './platform'
import { Assets } from './assets'
import { type OrderBook } from './orderBook'
import { formatUnits } from 'ethers/lib/utils'
import { ERC20Contract } from './ERC20Contract'
import { BeefyContract } from './beefyContract'
import { type WalletContent } from './walletContent'
import { ERC20Balances } from './ERC20Balances'

export class Rebalancer {
  private readonly chain: string
  private readonly beefy: BeefyApiClient
  private readonly tokenInfo: TokenInfoRetriever
  private readonly balances: ERC20Balances
  private readonly signer: Signer
  private readonly name: string
  private readonly supportedAssets: string[]
  private readonly supportedPlatform: PlatformList

  // Constants for risk and time calculations
  private assets!: Assets
  private tokens!: TokensList
  private annualPercentYields!: TvlResponse
  private liquidityPoolsBreakdowns!: LPBreakdownsResponse
  private totalValueLocked!: TvlResponse
  private liquidityPools!: TvlResponse
  private walletBalances!: WalletContent

  constructor (
    name: string,
    chain: string,
    signer: Signer,
    supportedAssets: string[],
    supportedPlatform: PlatformList
  ) {
    this.chain = chain
    this.beefy = new BeefyApiClient('https://api.beefy.finance')
    this.tokenInfo = new TokenInfoRetriever()
    this.name = name
    this.supportedAssets = supportedAssets
    this.supportedPlatform = supportedPlatform
    this.signer = signer

    if (this.signer.provider === undefined) {
      throw new Error('Signer provider is undefined')
    }
    this.balances = new ERC20Balances(this.signer)

    console.log('Rebalancer', this.name, 'created for chain', chain)
  }

  public async init () {
    // Fetching all necessary data for rebalancing
    ({
      vaults: this.assets,
      tokens: this.tokens,
      annualPercentYields: this.annualPercentYields,
      totalValueLocked: this.totalValueLocked,
      liquidityPools: this.liquidityPools,
      liquidityPoolsBreakdowns: this.liquidityPoolsBreakdowns,
      balances: this.walletBalances
    } = await this.fetchAll())

    console.log('Rebalancer', this.name, 'init')
  }

  async rebalanceOrders () {
    console.log('rebalancing', this.name, 'for chain', this.chain)

    // Create a portfolio with the assets
    const portfolio = new Portfolio(this.assets)
    portfolio.display()

    // Balance the portfolio and log the new risk and return
    return portfolio.balance(0)
  }

  async execute (balanceResult: OrderBook) {
    // If there are no orders, there is nothing to rebalanceOrders
    if (balanceResult.orders.length === 0) {
      console.log('Portfolio is balanced.')
      return
    }

    const { sellVaults, vaultsToExit } = this.getVaultsToExit(balanceResult)

    if (vaultsToExit.length > 0) {
      this.exitVaults(vaultsToExit)
      return
    }

    const {
      buyVaultsToEnterWithAllAssetsPresent,
      buyVaultsToEnterWithOnlyOneAssetPresent,
      buyVaultsToEnterWithoutAssetPresent
    } = this.getVaultsToEnter(balanceResult, sellVaults)

    // if we have a vault to enter, enter the position
    if (buyVaultsToEnterWithAllAssetsPresent.length > 0) {
      await this.enterVault(buyVaultsToEnterWithAllAssetsPresent, sellVaults)
      return
    }

    // we have to swap to enter position
    console.log('We have to swap to enter position')
    if (buyVaultsToEnterWithOnlyOneAssetPresent.length > 0) {
      console.log('Only one asset present in wallet, swap the other one')

      // first find the missing asset
      // TODO we take the first one, but we should take the one with the biggest amount (?)
      const asset1 = buyVaultsToEnterWithOnlyOneAssetPresent[0].asset1 as Token
      const asset2 = buyVaultsToEnterWithOnlyOneAssetPresent[0].asset2 as Token
      // TODO, use ratio, here we assume 50/50
      const amountToFind =
                (buyVaultsToEnterWithOnlyOneAssetPresent[0].price *
                    buyVaultsToEnterWithOnlyOneAssetPresent[0].current) /
                2
      if (sellVaults.findVaultByTokenAddress(asset1.address.toLowerCase()) != null) {
        await sellVaults.swapAssets(this.signer, asset2, asset1, amountToFind)
      } else if (sellVaults.findVaultByTokenAddress(asset2.address.toLowerCase()) != null) {
        await sellVaults.swapAssets(this.signer, asset1, asset2, amountToFind)
      }

      // eslint-disable-next-line no-secrets/no-secrets
      // const biggestBuyVault = buyVaultsToEnterWithOnlyOneAssetPresent.reduce((prev, current) => (prev.current > current.current) ? prev : current)

      // TODO enter position
      throw new Error('NOT IMPLEMENTED')
    }

    // we have to swap to enter position
    console.log('We have to swap to enter position')
    if (buyVaultsToEnterWithoutAssetPresent.length > 0) {
      console.log('No asset present in wallet, swap both')
      // TODO enter position
      throw new Error('NOT IMPLEMENTED')
    }

    /*     let tokenAvailableInWallet = sellVaults.filter((vault) => vault?.tokenProviderId === "wallet");

                         // sellVaults contains only wallet positions

                         // Find the highest value buy
                         let buyOrder = balanceResult.orders.filter((order) => order.type === OrderType.Buy).reduce((prev, current) => (prev.value > current.value) ? prev : current)

                         // Find the vault associated with the buy order
                         let buyVault = assets.find((vault) => vault.id === buyOrder.AssetId);

                         // If no corresponding assets found, do nothing
                         if ( buyVault === undefined) throw new Error("cannot link order to vault");

                         console.log("Enter position", buyOrder)

                         // Ensure buyvault.asset1 & 2 are not null
                         if (buyVault.asset1 === undefined || buyVault.asset2 === undefined) throw new Error("NOT IMPLEMENTED");

                         console.log("we need to find in our wallet [" + buyVault.asset1.symbol + "," + buyVault.asset2.symbol + "] to enter the position for a total of " + buyOrder.value + " USD")

                         // Find the token in the wallet
                         // @ts-ignore
                         let token1 = tokenAvailableInWallet.find((vault) => vault?.tokenAddress === buyVault.asset1?.address);
                         // @ts-ignore
                         let token2 = tokenAvailableInWallet.find((vault) => vault?.tokenAddress === buyVault.asset2?.address);

                         console.log("token1", token1)
                         console.log("token2", token2)
                 */
  }

  public async prepare () {
    // Filter out assets from unsupported chains
    this.assets.filterOutUnsupportedChains(this.chain)

    // Disable risky or unsupported assets
    this.assets.disableRiskyOrUnsupported(this.supportedPlatform, this.supportedAssets)

    // Enrich assets with additional data
    this.assets.enrichVaults(
      this.annualPercentYields,
      this.beefy,
      this.liquidityPoolsBreakdowns,
      this.totalValueLocked,
      this.chain,
      this.tokens,
      this.liquidityPools,
      this.walletBalances
    )

    // Disable assets with total value locked (TVL) too low
    this.assets.disableVaultWithTVLTooLow()

    // Add wallet balances to assets
    await this.assets.addWalletBalancesToVaults(
      this.chain,
      this.walletBalances,
      this.supportedAssets,
      this.tokenInfo,
      this.tokens
    )
  }

  private async enterVault (buyVaultsToEnterWithAllAssetsPresent: Vault[], sellVaults: Assets) {
    console.log('All assets present in wallet, we have a LP to create', buyVaultsToEnterWithAllAssetsPresent[0].id)
    // TODO enter position
    const vaultToEnter = buyVaultsToEnterWithAllAssetsPresent[0]
    console.log('Entering position', vaultToEnter.id, 'for a total of', vaultToEnter.current, 'USD')

    // check liquidity ratio for both token

    // find my platform in the vault

    const asset1 = vaultToEnter.asset1 as Token
    const asset2 = vaultToEnter.asset2 as Token

    const asset1Vault = this.assets.getMatchingAssetAddress(sellVaults, asset1.address)
    const asset2Vault = this.assets.getMatchingAssetAddress(sellVaults, asset2.address)

    const myPlatform = vaultToEnter.platform

    if (myPlatform == null) throw new Error('No platform found for vault ' + vaultToEnter.id)
    const liquiditiesToAdd = await myPlatform.quoteAddLiquidity(
      asset1.address,
      asset2.address,
      asset1Vault?.currentRaw as BigNumber,
      asset2Vault?.currentRaw as BigNumber
    )
    console.log(
      'Liquidity to add',
      formatUnits(liquiditiesToAdd.liquidity),
      formatUnits(liquiditiesToAdd.amountA, asset1.decimals),
      formatUnits(liquiditiesToAdd.amountB, asset2.decimals)
    )
    //    const ratio = await myPlatform.getLiquidityRatio(asset1.address, asset1.decimals, asset2.address, asset2.decimals)

    //   console.log("Liquidity ratio", ratio.toString())

    if (asset1Vault === undefined || asset1Vault.price === undefined || asset2Vault?.price == null || vaultToEnter?.price == null) throw new Error('Price not found')

    const tokenAValue = Number(formatUnits(liquiditiesToAdd.amountA, asset1.decimals)) * (asset1Vault.price)
    const tokenBValue = Number(formatUnits(liquiditiesToAdd.amountB, asset2.decimals)) * (asset2Vault.price)
    const liquidityValue = Number(formatUnits(liquiditiesToAdd.liquidity)) * (vaultToEnter.price)
    console.log('Token A value', tokenAValue)
    console.log('Token B value', tokenBValue)
    console.log('Liquidity value', liquidityValue)

    const delta = liquidityValue - tokenAValue - tokenBValue
    console.log('Cost', delta)
    const costInPercent = (delta / liquidityValue) * 100
    console.log('Cost in percent', costInPercent)

    const asset1Contract = new ERC20Contract(this.signer, asset1.address)
    const all1 = await asset1Contract.allowance(await this.signer.getAddress(), myPlatform.address)
    console.log('Allowance ' + asset1.symbol, formatUnits(all1, asset1.decimals))

    const asset2Contract = new ERC20Contract(this.signer, asset2.address)
    const all2 = await asset2Contract.allowance(await this.signer.getAddress(), myPlatform.address)
    console.log('Allowance ' + asset2.symbol, formatUnits(all2, asset2.decimals))

    const toAllow1 = liquiditiesToAdd.amountA.sub(all1)

    if (toAllow1.gt(0)) {
      console.log('To allow ' + asset1.symbol, formatUnits(toAllow1, asset1.decimals))

      await asset1Contract.approve(myPlatform.address, liquiditiesToAdd.amountA)
    }

    const toAllow2 = liquiditiesToAdd.amountB.sub(all2)

    if (toAllow2.gt(0)) {
      console.log('To allow ' + asset2.symbol, formatUnits(toAllow2, asset2.decimals))

      await asset2Contract.approve(myPlatform.address, liquiditiesToAdd.amountB)
    }

    const vaultToEnterContract = new ERC20Contract(this.signer, vaultToEnter.tokenAddress)
    const balRes1 = await vaultToEnterContract.balanceOf(await this.signer.getAddress())

    console.log('pool token balance before', formatUnits(balRes1, vaultToEnter.tokenDecimals))

    await myPlatform.addLiquidity(
      asset1.address,
      asset2.address,
      liquiditiesToAdd.amountA,
      liquiditiesToAdd.amountB,
      BigNumber.from(0),
      BigNumber.from(0),
      await this.signer.getAddress(),
      BigNumber.from(Number.MAX_SAFE_INTEGER - 1)
    )

    // check liquidity token balance

    const balRes2 = await vaultToEnterContract.balanceOf(await this.signer.getAddress())

    // console.log("pool token balance after", formatUnits(balRes2, vaultToEnter.tokenDecimals))

    // now => vault deposit

    // approve vault token

    await vaultToEnterContract.approve(vaultToEnter.earnContractAddress, balRes2)

    // deposit all

    await new BeefyContract(this.signer, vaultToEnter.earnContractAddress).depositAll()

    const balRes3 = await vaultToEnterContract.balanceOf(await this.signer.getAddress())

    console.log('pool token balance after', formatUnits(balRes3, vaultToEnter.tokenDecimals))
  }

  private readonly getVaultsToEnter = (balanceResult: OrderBook, sellVaults: Assets) => ({
    buyVaultsToEnterWithAllAssetsPresent: this.createBuyVaults(balanceResult).filterByVaultsByAssetPresence(
      sellVaults,
      (asset1, asset2) => asset1 && asset2
    ),
    buyVaultsToEnterWithOnlyOneAssetPresent: this.createBuyVaults(balanceResult).filterByVaultsByAssetPresence(
      sellVaults,
      (asset1, asset2) => !(asset1 && asset2) && (asset1 || asset2)
    ),
    buyVaultsToEnterWithoutAssetPresent: this.createBuyVaults(balanceResult).filterByVaultsByAssetPresence(
      sellVaults,
      (asset1, asset2) => !asset1 && !asset2
    )
  })

  private readonly createBuyVaults = (balanceResult: OrderBook) =>
    new Assets(
      balanceResult.orders
        .filter(order => order.type === OrderType.Buy)
        .flatMap(order => {
          const matchedVault = this.assets.getMatchedVault(order)
          return matchedVault != null ? [matchedVault] : []
        }),
      this.supportedPlatform
    )

  private exitVaults (vaultsToExit: Vault[]) {
    console.log('We still have assets to exit', vaultsToExit)

    // iterate each vault and exit the position
    vaultsToExit.forEach(vault => {
      console.log('Exiting position', vault.id, 'for a total of', vault.current, 'USD')
      // TODO exit position
      throw new Error('NOT IMPLEMENTED')
    })
    // we stop here, we will rebalanceOrders next time
  }

  private getVaultsToExit (balanceResult: OrderBook) {
    // map all sell orders to their respective assets
    const sellVaults: Assets = new Assets(
      balanceResult.orders
        .filter(order => order.type === OrderType.Sell)
        .flatMap(order => {
          const matchedVault = this.assets.getMatchedVault(order)
          return matchedVault != null ? [matchedVault] : []
        }),
      this.supportedPlatform
    )
    // filter out all sell orders whose tokenProviderID is not wallet
    const vaultsToExit = this.assets.filterOutWalletAssets(sellVaults)
    return { sellVaults, vaultsToExit }
  }

  private async fetchAll (): Promise<{
    vaults: Assets
    tokens: TokensList
    annualPercentYields: TvlResponse
    totalValueLocked: TvlResponse
    liquidityPools: TvlResponse
    liquidityPoolsBreakdowns: LPBreakdownsResponse
    balances: WalletContent
  }> {
    const [
      { tokens, balances },
      { vaults, annualPercentYields, totalValueLocked, liquidityPools, liquidityPoolsBreakdowns }
    ] = await Promise.all([this.fetchBalances(), this.fetchBeefy()])

    return {
      vaults: new Assets(vaults, this.supportedPlatform),
      tokens,
      annualPercentYields,
      totalValueLocked,
      liquidityPools,
      liquidityPoolsBreakdowns,
      balances
    }
  }

  private async fetchBalances () {
    const [tokens, walletAddress, vaults] = await Promise.all([
      this.beefy.getTokens(),
      this.signer.getAddress(),
      this.beefy.getVaults()
    ])

    const balances = await this.balances.getWalletVaultContent(vaults, this.chain, walletAddress)
    console.log('fetched balances', balances)

    const balances2 = await this.balances.getWalletTokenContent(tokens, this.chain, walletAddress)
    console.log('fetched balances', balances2)

    // merge both balances

    balances.merge(balances2)

    return { tokens, balances }
  }

  private async fetchBeefy () {
    const [vaults, annualPercentYields, totalValueLocked, liquidityPools, liquidityPoolsBreakdowns] =
            await Promise.all([
              this.beefy.getVaults(),
              this.beefy.getApy(),
              this.beefy.getTvl(),
              this.beefy.getLps(),
              this.beefy.getLPsBreakdown()
            ])
    return { vaults, annualPercentYields, totalValueLocked, liquidityPools, liquidityPoolsBreakdowns }
  }
}
