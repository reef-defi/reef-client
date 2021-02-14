import {ProviderName} from '../app/core/models/types';
import {environment} from '../environments/environment';

export const provider = {
  [ProviderName.INFURA]: {
    url: 'https://mainnet.infura.io/v3/' + environment.infuraApiKey,
    apiKey: environment.infuraApiKey,
    chainId: 1
  },
  [ProviderName.ALCHEMY]: {
    url: 'https://eth-mainnet.alchemyapi.io/v2/' + environment.alchemyApiKey,
    apiKey: environment.alchemyApiKey,
    chainId: 1
  },
  [ProviderName.LOCAL_FORK]: {
    url: 'https://localhost:8545',
    apiKey: '',
    chainId: 1337
  },
};

// 944e0650418142c4a352e7e802e71ee1 DEV

// 395d6f5d9a324c799a3becf85449122a PROD
