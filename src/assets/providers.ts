import {ProviderName} from '../app/core/models/types';

export const provider = {
  [ProviderName.INFURA]: {
    url: 'https://mainnet.infura.io/v3/944e0650418142c4a352e7e802e71ee1',
    apiKey: '944e0650418142c4a352e7e802e71ee1',
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
