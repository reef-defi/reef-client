import {ChainId, ProtocolAddresses, TokenSymbol} from '../app/core/models/types';

export const addresses: { [chainId: number]: ProtocolAddresses } = {

  [ChainId.MAINNET]: {
    REEF_BASKET: '0x16361f8Ca082c8481E74e53110E4c09Fb6631d55',
    REEF_VAULT_BASKET: '0x90B1453aB17c8269E8B8DA7ddbd54300B5BC775e',
    REEF_FARMING: '0xbB59060F803A2DB8769Fe327cbF89230DDf42B62',
    REEF_STAKING: '0xcCB53c9429d32594F404d01fbe9E65ED1DCda8D9',
    UNISWAP_ROUTER_V2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    [TokenSymbol.REEF_WETH_POOL]: '0x7937619a9bd1234a303e4fe752b8d4f37d40e20c',
    [TokenSymbol.REEF_USDT_POOL]: '0xea02e0f8f470de1107cb336f827c4192117574bb',
    // reef token
    [TokenSymbol.REEF]: '0xfe3e6a25e6b192a42a44ecddcd13796471735acf',
    [TokenSymbol.USDT]: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    [TokenSymbol.WETH]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    [TokenSymbol.BNB]: '',
  },
  [ChainId.BINANCE_SMART_CHAIN]: {
    REEF_BASKET: '',
    REEF_VAULT_BASKET: '',
    REEF_FARMING: '',
    REEF_STAKING: '',
    UNISWAP_ROUTER_V2: '',
    [TokenSymbol.REEF_WETH_POOL]: '',
    [TokenSymbol.REEF_USDT_POOL]: '',
    // reef token
    [TokenSymbol.REEF]: '0x0618aaaef80d148f44c4d5ceca1e290713c6251f',
    [TokenSymbol.USDT]: '',
    [TokenSymbol.WETH]: '',
    [TokenSymbol.BNB]: '',
  },
  [ChainId.LOCAL_FORK]: {
    REEF_BASKET: '0x16361f8Ca082c8481E74e53110E4c09Fb6631d55',
    REEF_VAULT_BASKET: '0x90B1453aB17c8269E8B8DA7ddbd54300B5BC775e',
    REEF_FARMING: '0xbB59060F803A2DB8769Fe327cbF89230DDf42B62',
    REEF_STAKING: '0xcCB53c9429d32594F404d01fbe9E65ED1DCda8D9',
    UNISWAP_ROUTER_V2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    [TokenSymbol.REEF_WETH_POOL]: '0x05aEb0ae4e5af3bAC40A2061C4B17fbDdD1a2F37', // TESTR pool
    [TokenSymbol.REEF_USDT_POOL]: '0x84392A8271473FEC9987e77D202E1B9466AD272e', // TESTR pool
    // reef token
    [TokenSymbol.REEF]: '0x3F2D78c7F1A20BF14E1f4D249973968146Fb5Ee1', // '0x894a180Cf0bdf32FF6b3268a1AE95d2fbC5500ab', // TESTR
    [TokenSymbol.USDT]: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    [TokenSymbol.WETH]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    [TokenSymbol.BNB]: '',
  }

};
