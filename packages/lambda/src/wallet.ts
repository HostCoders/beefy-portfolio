import { ethers } from 'ethers'

export interface TokenBalance {
  name: string
  symbol: string
  address: string
  balance: number
  balanceRaw: ethers.BigNumber
}

export const convertToNumber = (hex: ethers.BigNumber, decimals = 18): number => !hex ? 0 : parseFloat(ethers.utils.formatUnits(hex, decimals))
