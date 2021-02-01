import {IBasket, IBasketPoolsAndCoinInfo, IGenerateBasketResponse, IPoolsMetadata} from '../models/types';
import {adjectives, animals} from './basket-name-data';
import {BigNumber} from '@ethersproject/bignumber';

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
      addresses: pool.ExchangeAddress,
      allocation: +basket[pool.Symbol]
    }));

  const mooniswap = extractedPoolData
    .filter(pool => pool.Symbol.toLocaleLowerCase().includes('mooniswap'))
    .map((pool: IPoolsMetadata) => ({
      name: pool.Symbol,
      addresses: pool.ExchangeAddress,
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
    balancerWeights: balancer.map(pool => pool.allocation),
    mooniswapPools: mooniswap.map(mp => mp.addresses),
    mooniswapWeights: mooniswap.map(mp => mp.allocation),
  };
};

export const convertContractBasket = (basket: any[], allTokens: any) => {
  let allocs = basket[1].map((allocation, idx) => ({
    addrs: basket[2][idx] ? basket[2][idx] : [basket[3][idx - basket[2].length]],
    allocation,
  }));

  allocs = allocs.map(alloc => ({
    ...alloc,
    name: getName(alloc.addrs, allTokens)
  }));

  return {
    name: basket[0],
    pools: allocs
  };
};

const getName = (addresses: string[], allTokens: any): string => {
  const prefix = addresses.length > 1 ? 'Pool: ' : 'Token: ';
  const n = Object.keys(allTokens).filter((name: string) => addresses.includes(allTokens[name]));
  if (n.length === 0) {
    const word = addresses.reduce((memo, curr) => `${memo}${memo.length === 0 ? '' : '/'}${curr.slice(0, 5)}`, '');
    return `${prefix}${word}`;
  }
  if (n.length === addresses.length) {
    return `${prefix}${n.join('/')}`;
  }
  if (n.length < addresses.length) {
    const remainder = addresses.length - n.length;
    let word = '';
    for (let i = 0; i < remainder; ++i) {
      if (n[i]) {
        word += `${n[i]}/`;
      } else {
        word += `${addresses[i].slice(0, 5)}${addresses.length <= i ? '' : '/'}`;
      }
    }
    return `${prefix}${word}`;
  }
  // return `${prefix}${n ? n : addresses[0].slice(0, 5)}${addresses[1] ? '/' + addresses[1].slice(0, 5) : ''}`;
};

export const basketNameGenerator = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const word = `${adj} ${animal}`;
  return word.split(/ /g).map((x: string) =>
    `${x.substring(0, 1).toUpperCase()}${x.substring(1)}`)
    .join(' ');
};

export const convertToInt = (n: number) => {
  if (n < 1) {
    return Math.ceil(n);
  } else {
    return Math.floor(n);
  }
};

export const getBasketPoolNames = (baskets: IBasket[], pools: IPoolsMetadata[], tokens: any) => {
  let newB = baskets.map(basket => {
    const up = [];
    const bp = [];
    const mp = [];
    for (let i = 0; i < pools.length; i++) {
      const addr1 = pools[i].Assets[0].address.toLocaleLowerCase();
      const addr2 = pools[i].Assets[1].address.toLocaleLowerCase();
      if (pools[i].ExchangeName === 'Uniswap-v2') {
        const pair = basket.UniswapPools.pools
          .find(poolPair => (poolPair[0].toLocaleLowerCase() === addr1 && poolPair[1].toLocaleLowerCase() === addr2)
            || (poolPair[0].toLocaleLowerCase() === addr2 && poolPair[1].toLocaleLowerCase() === addr1));
        if (pair) {
          up.push({name: pools[i].Symbol, pair: [...pair]});
        }
      }
      if (pools[i].ExchangeName === 'Balancer') {
        const address = basket.BalancerPools.pools.find(addr => addr === pools[i].ExchangeAddress);
        if (address) {
          bp.push({name: pools[i].Symbol, address});
        }
      }
      if (pools[i].ExchangeName === 'Mooniswap') {
        const address = basket.MooniswapPools.pools.find(addr => addr === pools[i].ExchangeAddress);
        if (address) {
          mp.push({name: pools[i].Symbol, address});
        }
      }
    }
    return {
      ...basket,
      UniswapPools: {
        ...basket.UniswapPools,
        pools: getCorrectPool(basket.UniswapPools.pools, up, 'Uniswap')
      },
      BalancerPools: {
        ...basket.BalancerPools,
        pools: getCorrectPool(basket.BalancerPools.pools, bp, 'Balancer')
      },
      MooniswapPools: {
        ...basket.MooniswapPools,
        pools: getCorrectPool(basket.MooniswapPools.pools, mp, 'Mooniswap')
      },
    };
  });

  newB = newB.map(basket => {
    const temp = [];
    Object.keys(tokens).forEach(key => {
      const addr = basket.Tokens.pools.find(token => token === tokens[key]);
      if (addr) {
        temp.push({name: key, address: tokens[key]});
      }
    });
    return {
      ...basket,
      Tokens: {...basket.Tokens, pools: temp.length === basket.Tokens.pools.length ? [...temp] : [...basket.Tokens.pools]}
    };
  });

  return newB;
};

const getCorrectPool = (arr: string[], mapped: any, poolName = '') => {
  if (mapped.length === arr.length) {
    return [...mapped];
  } else {
    if (poolName === 'uniswap') {
      return arr.map(x => ({ name: `${poolName} Pool`, pair: [...x]}));
    } else {
      return arr.map(x => ({ name: `${poolName} Pool`, address: x}));
    }
  }
};

export const makeBasket = (basket: IGenerateBasketResponse): IGenerateBasketResponse => {
  const b: IGenerateBasketResponse = Object.keys(basket)
    .map(key => ({[key]: convertToInt(basket[key])})).reduce((memo, curr) => ({...memo, ...curr}));
  const weights = Object.values(b);
  const sum = weights.reduce((memo, curr) => memo + curr);
  if (sum === 100) {
    return b;
  }
  let max = Math.max(...weights);
  const poolMax = Object.keys(b).find(key => b[key] === max);
  max = sum > 100 ? max - (sum - 100) : max + (100 - sum);
  return {
    ...b,
    [poolMax]: max
  };
};

export const MaxUint256: BigNumber = BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

export const getKey = (obj: any, val: string): string =>  {
  // this is case sensitive
    return Object.keys(obj)[Object.values(obj).indexOf(val)];
};
