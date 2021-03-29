// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import {LogLevel} from '../app/shared/utils/dev-util-log-level';

export const environment = {
  production: false,
  logLevel: LogLevel.STD,
  reefApiUrl: 'https://baskets.reef.finance/v1',
  reefBinanceApiUrl: 'http://localhost:3000/v1',
  balancerPoolUrl: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer',
  ethPriceUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
  curvePoolUrl: 'https://www.curve.fi/raw-stats/apys.json',
  uniswapPoolUrl: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
  gasPriceUrl: 'https://www.etherchain.org/api/gasPriceOracle',
  cmcReefPriceUrl: 'https://web-api.coinmarketcap.com/v1/cryptocurrency/market-pairs/latest?slug=reef&start=1&limit=6&convert=USD',
  // reefNodeApiUrl: 'https://node-api.reef.finance/api',
  // reefNodeApiUrl: 'https://reef-node-api-jfwccyl2mq-nw.a.run.app/api',
  reefNodeApiUrl: 'http://localhost:3000/api',
  coinGeckoApiUrl: 'https://api.coingecko.com/api/v3',
  alchemyApiKey: 'bvO1UNMq6u7FCLBcW4uM9blROTOPd4_E',
  infuraApiKey: 'c80b6f5e0b554a59b295f7588eb958b7'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
