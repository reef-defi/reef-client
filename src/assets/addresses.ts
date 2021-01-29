import {AvailableSmartContractAddresses, ChainId} from '../app/core/models/types';

const addresses: AvailableSmartContractAddresses = {
  REEF_TOKEN: '0xfe3e6a25e6b192a42a44ecddcd13796471735acf',
  REEF_BASKET: '0x16361f8Ca082c8481E74e53110E4c09Fb6631d55',
  REEF_VAULT_BASKET: '0x90B1453aB17c8269E8B8DA7ddbd54300B5BC775e',
  REEF_FARMING: '0xbB59060F803A2DB8769Fe327cbF89230DDf42B62',
  REEF_STAKING: '0xcCB53c9429d32594F404d01fbe9E65ED1DCda8D9',
  UNISWAP_ROUTER_V2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  PURE_REEF_POOL: '0xfe3e6a25e6b192a42a44ecddcd13796471735acf',
  REEF_WETH_POOL: '0x7937619a9bd1234a303e4fe752b8d4f37d40e20c',
  REEF_USDT_POOL: '0xea02e0f8f470de1107cb336f827c4192117574bb',
  USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  ETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', //same as weth
  TESTR: '0x894a180Cf0bdf32FF6b3268a1AE95d2fbC5500ab',
};

export const getChainAddresses = (chainId: ChainId): AvailableSmartContractAddresses => {
  console.log('TODO !!! - return from local object with chainId properties');
  return addresses;
};

/*
export const addresses = {
  [ChainId.MAINNET]: {
    REEF_TOKEN: '0xfe3e6a25e6b192a42a44ecddcd13796471735acf',
    REEF_BASKET: '0x16361f8Ca082c8481E74e53110E4c09Fb6631d55',
    REEF_VAULT_BASKET: '0x90B1453aB17c8269E8B8DA7ddbd54300B5BC775e',
    REEF_FARMING: '0xbB59060F803A2DB8769Fe327cbF89230DDf42B62',
    REEF_STAKING: '0xcCB53c9429d32594F404d01fbe9E65ED1DCda8D9',
    UNISWAP_ROUTER_V2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    PURE_REEF_POOL: '0xfe3e6a25e6b192a42a44ecddcd13796471735acf',
    REEF_WETH_POOL: '0x7937619a9bd1234a303e4fe752b8d4f37d40e20c',
    REEF_USDT_POOL: '0xea02e0f8f470de1107cb336f827c4192117574bb',
    tokens:{
      REEF: '0xfe3e6a25e6b192a42a44ecddcd13796471735acf',
      USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      ETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', //same as weth
      TESTR: '0x894a180Cf0bdf32FF6b3268a1AE95d2fbC5500ab',
    }
  }
};
*/

export const reefPools = {
  REEF_TOKEN: 0,
  REEF_WETH_POOL: 0,
  REEF_USDT_POOL: 1,
};

export const lpTokens = {
  '0xea02e0f8f470de1107cb336f827c4192117574bb': 'REEF-USDT LP Token',
  '0x7937619a9bd1234a303e4fe752b8d4f37d40e20c': 'REEF-ETH LP Token',
}
