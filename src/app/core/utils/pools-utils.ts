import { IBasketPoolsAndCoinInfo, IGenerateBasketResponse, IPoolsMetadata } from '../models/types';

export const getBasketPoolsAndCoins = (basket: IGenerateBasketResponse, allPools: IPoolsMetadata[], allCoins: any)
  : IBasketPoolsAndCoinInfo => {
  const poolNames = Object.keys(basket).filter((isPool: string) => isPool.includes(' '));
  const coinNames = Object.keys(basket).filter((isPool: string) => !isPool.includes(' '));
  const extractedPoolData = allPools.filter((poolData: IPoolsMetadata) => poolNames.includes(poolData.Symbol));
  const uniswap = extractedPoolData
    .filter(pool => pool.Symbol.toLocaleLowerCase().includes('uniswap'))
    .map((pool: IPoolsMetadata) => ({
      name: pool.Symbol,
      addresses: [pool.Assets[0].address, pool.Assets[1].address],
      allocation: +basket[pool.Symbol]
    }));
  const balancer = extractedPoolData
    .filter(pool => pool.Symbol.toLocaleLowerCase().includes('balancer'))
    .map((pool: IPoolsMetadata) => ({
      name: pool.Symbol,
      addresses: [pool.Assets[0].address, pool.Assets[1].address],
      allocation: +basket[pool.Symbol]
    }));

  const coins = Object.keys(allCoins)
    .filter(coinName => coinNames.includes(coinName))
    .map(coinName => ({coinName, allocation: +basket[coinName], address: allCoins[coinName]}));
  return {
    uniswapPools: uniswap.map(uniPool => uniPool.addresses),
    uniSwapWeights: uniswap.map(uniPool => uniPool.allocation),
    tokenPools: coins.map(coin => coin.address),
    tokenWeights: coins.map(coin => coin.allocation),
    balancerPools: balancer.map(balancerPool => balancerPool.addresses),
    balancerWeights: balancer.map(balancerPool => balancerPool.allocation)
  };
};

export const basketNameGenerator = (basketPoolInfo: IBasketPoolsAndCoinInfo, basket: IGenerateBasketResponse) => {
  const balancer = basketPoolInfo.balancerPools.length && 'balancer_' || '';
  const uniswap = basketPoolInfo.uniswapPools.length && 'uniswap_' || '';
  const coins = basketPoolInfo.tokenPools.length && 'tokens_' || '';
  const strings = Object.keys(basket).join('_');
  return `${balancer}${uniswap}${coins}_${strings}`;
};
