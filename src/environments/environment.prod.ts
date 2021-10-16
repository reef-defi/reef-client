import {LogLevel} from '../app/shared/utils/dev-util-log-level';

export const environment = {
  production: true,
  logLevel: LogLevel.WARNING,
  reefApiUrl: 'https://baskets.reef.finance/v1',
  reefBinanceApiUrl: 'http://localhost:3000/v1',
  balancerPoolUrl: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer',
  ethPriceUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
  curvePoolUrl: 'https://www.curve.fi/raw-stats/apys.json',
  uniswapPoolUrl: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
  gasPriceUrl: 'https://www.etherchain.org/api/gasPriceOracle',
  cmcReefPriceUrl: 'https://web-api.coinmarketcap.com/v1/cryptocurrency/market-pairs/latest?slug=reef&start=1&limit=6&convert=USD',
  reefNodeApiUrl: 'https://node-api.reef.finance/api',
  infuraApiKey: '395d6f5d9a324c799a3becf85449122a',
  alchemyApiKey: 'yxcjm59ypt3tMf4SBUa8-wbrMtgrtesF',
  coinGeckoApiUrl: 'https://api.coingecko.com/api/v3',
};
