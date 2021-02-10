import {ProviderName} from '../app/core/models/types';

export const provider = {
  [ProviderName.INFURA]: {
    url: 'https://mainnet.infura.io/v3/25bb2c8c8bfc420ab37e1016706547cf',
    apiKey: '25bb2c8c8bfc420ab37e1016706547cf',
    chainId: 1
  },
  [ProviderName.ALCHEMY]: {
    url: '',
    apiKey: '',
    chainId: 1
  },
  [ProviderName.LOCAL_FORK]: {
    url: 'https://localhost:8545',
    apiKey: '',
    chainId: 1337
  },
};
