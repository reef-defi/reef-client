import {ProviderName} from '../../core/models/types';
import {provider} from '../../../assets/providers';

// TODO currently the provider params are defined
//  before metamask connects - if there is a way to set provider
//  from metamask values in connector.service use these methods to get provider based on chainId
export class ChainUtils {

  static getProviderApiKey(providerName: ProviderName): string {
    const apiKey = provider[providerName].apiKey;
    if (!apiKey) {
      throw new Error('No provider apiKey defined for providerName=' + providerName);
    }
    return apiKey;
  }

  static getProviderUrl(providerName: ProviderName): string {
    const url = provider[providerName].url;
    if (!url) {
      throw new Error('No provider url defined for providerName=' + providerName);
    }
    return url;
  }

  static getProviderChainId(providerName: ProviderName): number {
    const chainId = provider[providerName].chainId;
    if (!chainId) {
      throw new Error('No provider chainId defined for providerName=' + providerName);
    }
    return chainId;
  }
}
