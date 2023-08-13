import { Swap } from './Swap'
import { ethers } from 'ethers'

jest.setTimeout(100000)
describe('Swap', () => {
  it('should swap tokens correctly', async () => {
    const chainID = 137
    // eslint-disable-next-line no-secrets/no-secrets
    const src = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' // DAI address
    // eslint-disable-next-line no-secrets/no-secrets
    const dst = '0xa3fa99a148fa48d14ed51d610c367c61876997f1' // USDC address
    // eslint-disable-next-line no-secrets/no-secrets
    const from = '0xe6a1d739422166880d689330be5cf17a7112709d'
    const amount = '1000000000000000' // 1 DAI (with 18 decimal places)
    const slippage = 0 // 0 slippage

    // eslint-disable-next-line no-secrets/no-secrets
    const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon/f3bd996ea0ae4c1ac5aee7905f2ad8947715d45233456e54200506230939b74d')
    const wallet = new ethers.Wallet('d843c4ab100488de26d533a62fb0a7c49f23103c329e41349a725818e2cb5451', provider)

    await new Swap(wallet).swap(chainID, src, dst, from, amount, slippage)
  })
})
