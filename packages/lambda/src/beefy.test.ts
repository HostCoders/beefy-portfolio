import BeefyApiClient, { type LPBreakdownsResponse, type TokensList, type TvlResponse, type Vault } from './beefy'
import { BigNumber } from 'ethers'

const client = new BeefyApiClient('https://api.beefy.finance')

describe('Beefy API', () => {
  let vaults: Vault[] = []
  let tvl: TvlResponse
  let apy: TvlResponse
  let lps: TvlResponse
  let tokens: TokensList
  let lpBreakdowns: LPBreakdownsResponse

  describe('getVaults', () => {
    it('should apy an array of vaults', async () => {
      vaults = await client.getVaults()
      expect(vaults.length).toBeGreaterThan(0)
    })
  })

  describe('getTvl', () => {
    it('should apy a TvlResponse object', async () => {
      tvl = await client.getTvl()
      expect(typeof tvl).toBe('object')
    })
  })

  describe('getApy', () => {
    it('should apy an APY response object', async () => {
      apy = await client.getApy()
      expect(typeof apy).toBe('object')
    })
  })

  describe('getLps', () => {
    it('should apy an LPS response object', async () => {
      lps = await client.getLps()
      expect(typeof lps).toBe('object')
    })
  })

  describe('getTokens', () => {
    it('should apy a TokensList response object', async () => {
      tokens = await client.getTokens()
      expect(typeof tokens).toBe('object')
    })
  })

  describe('getLPsBreakdown', () => {
    it('should apy an LPBreakdownsResponse object', async () => {
      lpBreakdowns = await client.getLPsBreakdown()
      expect(typeof lpBreakdowns).toBe('object')
    })
  })

  describe('findTVL', () => {
    it('should find a TVL by id', async () => {
      vaults = await client.getVaults()

      const id = vaults[0].id
      const foundTvl = client.findTVL(id, tvl)
      expect(foundTvl).toBeDefined()
    })
  })

  describe('getRisk', () => {
    it('should calculate a low risk level for a battle-tested, audited, verified and established platform with high liquidity', () => {
      const vault: Vault = {
        currentRaw: BigNumber.from(0),
        current: 0,
        disabled: [],
        price: 0,
        return: 0,
        risk: 0,
        apy: 0,
        assets: [],
        chain: '',
        createdAt: 0,
        earnContractAddress: '',
        earnedToken: '',
        earnedTokenAddress: '',
        id: '',
        lastHarvest: 0,
        name: '',
        oracle: '',
        oracleId: '',
        platformId: '',
        pricePerFullShare: '',
        status: '',
        strategy: '',
        strategyTypeId: '',
        token: '',
        tokenAddress: '',
        tokenDecimals: 0,
        tokenProviderId: '',
        tvl: 0,
        // add required fields here
        risks: ['BATTLE_TESTED', 'AUDIT', 'CONTRACTS_VERIFIED', 'PLATFORM_ESTABLISHED', 'LIQ_HIGH']
        // add the rest of the required properties for a Vault object
      }

      const risk = BeefyApiClient.getRisk(vault)
      expect(risk).toBeLessThan(5)
    })

    it('should calculate a high risk level for a new and experimental strategy, with high complexity and low liquidity', () => {
      const vault: Vault = {
        currentRaw: BigNumber.from(0),
        current: 0,
        disabled: [],
        price: 0,
        return: 0,
        risk: 0,
        apy: 0,
        assets: [],
        chain: '',
        createdAt: 0,
        earnContractAddress: '',
        earnedToken: '',
        earnedTokenAddress: '',
        id: '',
        lastHarvest: 0,
        name: '',
        oracle: '',
        oracleId: '',
        platformId: '',
        pricePerFullShare: '',
        status: '',
        strategy: '',
        strategyTypeId: '',
        token: '',
        tokenAddress: '',
        tokenDecimals: 0,
        tokenProviderId: '',
        tvl: 0,
        // add required fields here
        risks: ['NEW_STRAT', 'EXPERIMENTAL_STRAT', 'COMPLEXITY_HIGH', 'LIQ_LOW']
        // add the rest of the required properties for a Vault object
      }

      const risk = BeefyApiClient.getRisk(vault)
      expect(risk).toBeGreaterThan(20)
    })

    it('should calculate a medium risk level for a medium cap, partially collateralized, algo stablecoin with medium complexity', () => {
      const vault: Vault = {
        currentRaw: BigNumber.from(0),
        current: 0,
        disabled: [],
        price: 0,
        return: 0,
        risk: 0,
        apy: 0,
        assets: [],
        chain: '',
        createdAt: 0,
        earnContractAddress: '',
        earnedToken: '',
        earnedTokenAddress: '',
        id: '',
        lastHarvest: 0,
        name: '',
        oracle: '',
        oracleId: '',
        platformId: '',
        pricePerFullShare: '',
        status: '',
        strategy: '',
        strategyTypeId: '',
        token: '',
        tokenAddress: '',
        tokenDecimals: 0,
        tokenProviderId: '',
        tvl: 0,
        // add required fields here
        risks: ['MCAP_MEDIUM', 'PARTIAL_COLLAT_ALGO_STABLECOIN', 'COMPLEXITY_MID']
        // add the rest of the required properties for a Vault object
      }

      const risk = BeefyApiClient.getRisk(vault)
      expect(risk).toBeGreaterThan(5)
      expect(risk).toBeLessThan(30)
    })

    it('should apy a minimum risk level of 1, even if calculated risk is negative', () => {
      const vault: Vault = {
        currentRaw: BigNumber.from(0),
        current: 0,
        disabled: [],
        price: 0,
        return: 0,
        risk: 0,
        apy: 0,
        assets: [],
        chain: '',
        createdAt: 0,
        earnContractAddress: '',
        earnedToken: '',
        earnedTokenAddress: '',
        id: '',
        lastHarvest: 0,
        name: '',
        oracle: '',
        oracleId: '',
        platformId: '',
        pricePerFullShare: '',
        status: '',
        strategy: '',
        strategyTypeId: '',
        token: '',
        tokenAddress: '',
        tokenDecimals: 0,
        tokenProviderId: '',
        tvl: 0,
        // add required fields here
        risks: ['BATTLE_TESTED', 'IL_NONE', 'LIQ_HIGH', 'MCAP_LARGE', 'PLATFORM_ESTABLISHED', 'AUDIT', 'CONTRACTS_VERIFIED', 'ADMIN_WITH_TIMELOCK']
        // add the rest of the required properties for a Vault object
      }

      const risk = BeefyApiClient.getRisk(vault)
      expect(risk).toBe(1)
    })
  })
})
