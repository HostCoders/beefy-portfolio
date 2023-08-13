import { Rebalancer } from './rebalancer'
import { ethers } from 'ethers'
import { Platform, type PlatformList } from './platform'
import { config } from 'dotenv'

config()

describe('Swap', () => {
  it('should rebalance', async () => {
    const privateKey = process.env.PK
    if (privateKey == null) throw new Error('No private key')
    let wallet = new ethers.Wallet(privateKey)
    // eslint-disable-next-line no-secrets/no-secrets
    const provider2 = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon/f3bd996ea0ae4c1ac5aee7905f2ad8947715d45233456e54200506230939b74d')
    wallet = wallet.connect(provider2)
    const supportedPlatform: PlatformList = {
      wallet: new Platform('', '', wallet),
      // eslint-disable-next-line no-secrets/no-secrets
      pearl: new Platform('pearl', '0x06374f57991cdc836e5a318569a910fe6456d230', wallet),
      // "gamma": new Platform("", "", provider),
      // eslint-disable-next-line no-secrets/no-secrets
      velodrome: new Platform('velodrome', '0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858', wallet)
    }

    // ["wallet", "pearl", "gamma"];
    const supportedAssets = ['USDR', 'WUSDR', 'USDC', 'USD+', 'DOLA', 'FRAX', 'MAI', 'ALUSD', 'DAI', 'USDT']
    const rebalancer = new Rebalancer('rebal-polygon', 'polygon', wallet,
      supportedAssets,
      supportedPlatform)
    await rebalancer.init()
    await rebalancer.prepare()
    const orders = await rebalancer.rebalanceOrders()
    await rebalancer.execute(orders)
  }
  )
})
