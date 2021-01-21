// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  reefApiUrl: 'https://baskets.reef.finance/v1',
  reefBinanceApiUrl: 'http://localhost:3000/v1',
  balancerPoolUrl: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer',
  ethPriceUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
  curvePoolUrl: 'https://www.curve.fi/raw-stats/apys.json',
  uniswapPoolUrl: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
  gasPriceUrl: 'https://www.etherchain.org/api/gasPriceOracle',
  cmcReefPriceUrl: 'https://web-api.coinmarketcap.com/v1/cryptocurrency/market-pairs/latest?slug=reef&start=1&limit=6&convert=USD',
  reefNodeApiUrl: 'https://node-api.reef.finance/api',
  // reefNodeApiUrl: 'http://localhost:3000/api',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
