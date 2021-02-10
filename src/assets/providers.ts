import {ProviderName} from '../app/core/models/types';

export const provider = {
  [ProviderName.INFURA]: {
    url: 'https://mainnet.infura.io/v3/25bb2c8c8bfc420ab37e1016706547cf',
    apiKey: '25bb2c8c8bfc420ab37e1016706547cf',
    chainId: 1
  },
  [ProviderName.ALCHEMY]: {
    url: 'https://eth-mainnet.alchemyapi.io/v2/yxcjm59ypt3tMf4SBUa8-wbrMtgrtesF',
    apiKey: 'yxcjm59ypt3tMf4SBUa8-wbrMtgrtesF',
    chainId: 1
  },
  [ProviderName.LOCAL_FORK]: {
    url: 'https://localhost:8545',
    apiKey: '',
    chainId: 1337
  },
};
