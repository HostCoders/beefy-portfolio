import { type Token, type TokensList, type Vault } from './beefy'
import { WalletContent } from './walletContent'
import { convertToNumber, type TokenBalance } from './wallet'
import { ERC20Contract } from './ERC20Contract'
import { type Signer } from 'ethers'

/**
 * Class to handle ERC20Contract token balance related functions
 */
export class ERC20Balances {
  constructor (private readonly signer: Signer) {
  }

  /**
     * Retrieves all token balances for a given wallet and chain
     * @param tokenList List of tokens
     * @param chain The chain to fetch token balances from
     * @param wallet The wallet address to query balances from
     * @param block The block number to query past balances
     * @returns An array of token balance data
     */
  /*   public getVaultTokenBalances = async (tokenList: TokensList, chain: string, wallet: string, block: number): Promise<{
           name: string,
           symbol: string,
           balance: number
       }[]> => (await Promise.all(
           Object.values(tokenList[chain]).map(async (token: Token) => {
                   balance : await new ethers.Contract(token.address, this.ERC20_ABI, this.signer)
                       .balanceOf(wallet, {blockTag: block}),
                       name : token.name,
                       symbol : token.symbol,

               }
           )
       )) */

  public getWalletVaultContent = async (tokenList: Vault[], chain: string, wallet: string): Promise<WalletContent> => new WalletContent(await this.getVaultTokenBalances(tokenList, chain, wallet))

  public getWalletTokenContent = async (tokenList: TokensList, chain: string, wallet: string): Promise<WalletContent> => new WalletContent(await this.getTokenBalances(tokenList, chain, wallet))

  private readonly getVaultTokenBalances = async (
    tokenList: Vault[],
    chain: string,
    wallet: string
  ): Promise<
  TokenBalance[]
  > =>
    (await Promise.allSettled(
      Object.values(tokenList)
        .filter((token: Vault) => token.chain === chain)
        .map(async (token: Vault) => {
          const balanceRaw = await new ERC20Contract(this.signer, token.earnedTokenAddress).balanceOf(wallet)
          return ({
            name: token.earnedToken,
            symbol: token.name,
            address: token.earnedTokenAddress,
            balance: convertToNumber(
              balanceRaw,
              18
            ),
            balanceRaw
          })
        })
    ))
      .filter(({ status }: PromiseSettledResult<TokenBalance>) => status === 'fulfilled')
    // @ts-expect-error
      .map(({ value }) => value)
      .filter(({ balance }) => balance > 0)
      .reduce((acc: TokenBalance[], curr) =>
        acc.find(({ address }) => address === curr.address) ? acc : [...acc, curr], [])

  private readonly getTokenBalances = async (
    tokenList: TokensList,
    chain: string,
    wallet: string
  ): Promise<
  TokenBalance[]
  > =>
    (await Promise.allSettled(
      Object.values(tokenList[chain])
        .map(async (token: Token) => {
          const balanceRaw = await new ERC20Contract(this.signer, token.address).balanceOf(wallet)
          return ({
            name: token.name,
            symbol: token.symbol,
            address: token.address,
            balance: convertToNumber(
              balanceRaw,
              token.decimals
            ),
            balanceRaw
          })
        })
    ))
      .filter(({ status }: PromiseSettledResult<TokenBalance>) => status === 'fulfilled')
    // @ts-expect-error
      .map(({ value }) => value)
      .filter(({ balance }) => balance > 0)
      .reduce((acc: TokenBalance[], curr) =>
        acc.find(({ address }) => address === curr.address) ? acc : [...acc, curr], [])

  /**
     * Converts a value in hex format to a decimal number
     * @param hex The original value in hex format
     * @param decimals The number of decimals used by the token, default 18
     * @returns The converted decimal number
     */
}
