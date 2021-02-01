import {AvailableSmartContractAddresses, IChainData, IProviderUserInfo, TokenSymbol} from '../app/core/models/types';

const addresses: AvailableSmartContractAddresses = {
  REEF_BASKET: '0x16361f8Ca082c8481E74e53110E4c09Fb6631d55',
  REEF_VAULT_BASKET: '0x90B1453aB17c8269E8B8DA7ddbd54300B5BC775e',
  REEF_FARMING: '0xbB59060F803A2DB8769Fe327cbF89230DDf42B62',
  REEF_STAKING: '0xcCB53c9429d32594F404d01fbe9E65ED1DCda8D9',
  UNISWAP_ROUTER_V2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  REEF_WETH_POOL: '0x7937619a9bd1234a303e4fe752b8d4f37d40e20c',
  REEF_USDT_POOL: '0xea02e0f8f470de1107cb336f827c4192117574bb',
  // reef token
  REEF: '0xfe3e6a25e6b192a42a44ecddcd13796471735acf',
  USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  // ETH: '0x0000000000000000000000000000000000000000', //same as weth
  // ETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  TESTR: '0x894a180Cf0bdf32FF6b3268a1AE95d2fbC5500ab'
};

const labels = {
  [TokenSymbol.REEF]: 'Reef token',
  [TokenSymbol.REEF_WETH_POOL]: 'REEF-ETH LP Token',
  [TokenSymbol.REEF_USDT_POOL]: 'REEF-USDT LP Token',
};

export const getChainAddresses = (chainInfo: IChainData): AvailableSmartContractAddresses => {
  if (chainInfo.chain_id === 1337) {
    console.log('Using forked network REEF===TESTR token');
    addresses[TokenSymbol.REEF] = addresses[TokenSymbol.TESTR];
    addresses[TokenSymbol.REEF_WETH_POOL] = '0x05aEb0ae4e5af3bAC40A2061C4B17fbDdD1a2F37';
    addresses[TokenSymbol.REEF_USDT_POOL] = '0x84392A8271473FEC9987e77D202E1B9466AD272e';
  }
  return addresses;
};

export const reefPools = {
  // PURE_REEF_POOL: 0,
  REEF: 0,
  REEF_WETH_POOL: 0,
  REEF_USDT_POOL: 1,
};

export const toTokenContractAddress = (
  availableSmartContractAddresses: AvailableSmartContractAddresses, tokenSymbol: TokenSymbol): string => {
  if (tokenSymbol === TokenSymbol.ETH) {
    tokenSymbol = TokenSymbol.WETH;
  }
  const address = availableSmartContractAddresses[tokenSymbol];
  if (!address) {
    console.log('ERROR getting contract for ', tokenSymbol);
  }
  return address;
};

export const getAddressLabel = (info: IProviderUserInfo, contractAddress: string): string => {
  const tokenSymbol = toTokenSymbol(info, contractAddress);
  return toTokenLabel(tokenSymbol);
};

export const toTokenLabel = (tokenSymbol: TokenSymbol): string => {
  return tokenSymbol ? labels[tokenSymbol] || tokenSymbol.toString() : '';
};

export const toTokenSymbol = (info: IProviderUserInfo, tokenContractAddress): TokenSymbol => {
  const tokenSymbolStr = Object.keys(info.availableSmartContractAddresses)
    .find(ts => tokenContractAddress.toLowerCase() === info.availableSmartContractAddresses[ts].toLowerCase());
  if (!TokenSymbol[tokenSymbolStr]) {
    console.log('ERROR resolving address to token symbol =', tokenContractAddress);
  }
  return TokenSymbol[tokenSymbolStr];
};
