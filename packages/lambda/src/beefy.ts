import axios from 'axios'
import { type ethers } from 'ethers'
import { type Asset } from './portfolio'
import { type Platform } from './platform'

export interface Vault extends Asset {
  apy: number
  id: string
  name: string
  token: string
  tokenAddress: string
  tokenDecimals: number
  tokenProviderId: string
  earnedToken: string
  earnedTokenAddress: string
  earnContractAddress: string
  oracle: string
  oracleId: string
  status: string
  platformId: string
  assets: string[]
  strategyTypeId: string
  risks: string[]
  addLiquidityUrl?: string
  removeLiquidityUrl?: string
  buyTokenUrl?: string
  network?: string
  createdAt: number
  chain: string
  strategy?: string
  lastHarvest: number
  pricePerFullShare: string
  tvl: number
  // added for portfolio management
  return: number // Expected apy (%)
  risk: number // Risk (%)
  price: number // Price (USD)
  current: number // Current quantity
  currentRaw: ethers.BigNumber // Current quantity (raw)
  disabled: string[]
  asset1?: Token
  asset2?: Token
  asset3?: Token
  asset4?: Token
  platform?: Platform
}

export type TvlResponse = Record<string, number>

export interface Token {
  name: string
  symbol: string
  address: string
  decimals: number
}

export type TokensList = Record<string, Record<string, Token>>

interface LPBreakdown {
  price: number
  tokens: string[]
  balances: string[]
  totalSupply: string
}

export type LPBreakdownsResponse = Record<string, LPBreakdown>

/**
 * This class represents a client to interact with the Beefy API
 */
class BeefyApiClient {
  baseUrl: string

  constructor (baseUrl: string) {
    this.baseUrl = baseUrl
  }

  static getRisk (vault: Vault) {
    let riskLevel = 1
    // console.table(vault.assets);
    // console.table(vault.risks);

    if (vault.risks === undefined) return Number.MAX_SAFE_INTEGER

    for (const risk of vault.risks) {
      if (risk === 'COMPLEXITY_LOW') riskLevel -= 1
      if (risk === 'COMPLEXITY_MID') riskLevel += 5
      if (risk === 'COMPLEXITY_HIGH') riskLevel += 10

      if (risk === 'BATTLE_TESTED') riskLevel -= 1
      if (risk === 'NEW_STRAT') riskLevel += 10
      if (risk === 'EXPERIMENTAL_STRAT') riskLevel += 30

      if (risk === 'IL_NONE') riskLevel -= 1
      if (risk === 'IL_LOW') riskLevel += 5
      if (risk === 'IL_HIGH') riskLevel += 10

      if (risk === 'ALGO_STABLE') riskLevel += 5
      if (risk === 'PARTIAL_COLLAT_ALGO_STABLECOIN') riskLevel += 15
      if (risk === 'OVER_COLLAT_ALGO_STABLECOIN') riskLevel += 10

      if (risk === 'LIQ_HIGH') riskLevel -= 1
      if (risk === 'LIQ_LOW') riskLevel += 5

      if (risk === 'MCAP_LARGE') riskLevel -= 1
      if (risk === 'MCAP_MEDIUM') riskLevel += 5
      if (risk === 'MCAP_SMALL') riskLevel += 10
      if (risk === 'MCAP_MICRO') riskLevel += 50

      if (risk === 'SUPPLY_CENTRALIZED') riskLevel += 30

      if (risk === 'PLATFORM_ESTABLISHED') riskLevel -= 1
      if (risk === 'PLATFORM_NEW') riskLevel += 30

      if (risk === 'NO_AUDIT') riskLevel += 50
      if (risk === 'AUDIT') riskLevel -= 1

      if (risk === 'CONTRACTS_VERIFIED') riskLevel -= 1
      if (risk === 'CONTRACTS_UNVERIFIED') riskLevel += 30

      if (risk === 'ADMIN_WITH_TIMELOCK') riskLevel -= 1
      if (risk === 'ADMIN_WITHOUT_TIMELOCK') riskLevel += 30
    }
    // console.table(riskLevel);

    return riskLevel < 1 ? 1 : riskLevel
  }

  /**
     * Retrieves information about each Beefy vault, including retired (eol) vaults.
     * @returns A promise that resolves to an array of vaults
     */
  getVaults = async (): Promise<Vault[]> => (await axios.get(`${this.baseUrl}/vaults`)).data

  getTvl = async (): Promise<TvlResponse> => (await axios.get(`${this.baseUrl}/tvl`)).data

  getApy = async (): Promise<TvlResponse> => (await axios.get(`${this.baseUrl}/apy`)).data

  getLps = async (): Promise<TvlResponse> => (await axios.get(`${this.baseUrl}/lps`)).data

  getTokens = async (): Promise<TokensList> => (await axios.get(`${this.baseUrl}/tokens`)).data

  getLPsBreakdown = async (): Promise<LPBreakdownsResponse> => (await axios.get(`${this.baseUrl}/lps/breakdown`)).data

  findTVL (id: string, tvls: TvlResponse) {
    // @ts-expect-error
    for (const property in tvls) if (tvls[property][id] !== undefined) return tvls[property][id]
  }
}

export default BeefyApiClient
