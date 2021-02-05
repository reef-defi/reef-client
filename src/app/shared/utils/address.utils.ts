import {
  IChainData,
  IProviderUserInfo,
  ProtocolAddresses,
  TokenSymbol,
} from '../../core/models/types';
import { addresses } from '../../../assets/addresses';

export class AddressUtils {
  private static labels = {
    [TokenSymbol.REEF]: 'Reef token',
    [TokenSymbol.REEF_WETH_POOL]: 'REEF-ETH LP Token',
    [TokenSymbol.REEF_USDT_POOL]: 'REEF-USDT LP Token',
  };

  private static reefPools = {
    [TokenSymbol.REEF]: 0,
    [TokenSymbol.REEF_WETH_POOL]: 0,
    [TokenSymbol.REEF_USDT_POOL]: 1,
  };

  static getChainAddresses(chainInfo: IChainData): ProtocolAddresses {
    const chainAddresses = addresses[chainInfo.chain_id];
    if (!!chainAddresses) {
      console.log('ADDRESSES for chainId=', chainInfo.chain_id, chainInfo.name);
    } else {
      throw new Error('ERROR getting addresses for chain=' + chainInfo);
    }
    return chainAddresses;
  }

  static getTokenSymbolReefPoolId(tokenSymbol: TokenSymbol): number {
    const poolId = AddressUtils.reefPools[tokenSymbol];
    if (poolId == null) {
      console.warn('ERROR pool id not found for ', tokenSymbol);
    }
    return poolId;
  }

  static getReefPoolByPairSymbol(
    reefPoolOppositeTokenSymbol: TokenSymbol,
    availableSmartContractAddresses: ProtocolAddresses
  ): TokenSymbol {
    if (reefPoolOppositeTokenSymbol === TokenSymbol.ETH) {
      reefPoolOppositeTokenSymbol = TokenSymbol.WETH;
    }
    const poolTokenSymbolStr = `${TokenSymbol.REEF}_${reefPoolOppositeTokenSymbol}_POOL`;

    if (!availableSmartContractAddresses[poolTokenSymbolStr]) {
      console.warn(
        'ERROR pool tokenSymbol does not exist in addresses = ',
        poolTokenSymbolStr
      );
      return null;
    }
    const tokenSymbolIdent = TokenSymbol[poolTokenSymbolStr];
    if (!tokenSymbolIdent) {
      console.warn(
        'ERROR pool tokenSymbol does not exist in TokenSymbol enum = ',
        poolTokenSymbolStr
      );
      return null;
    }
    return tokenSymbolIdent;
  }

  static getTokenSymbolContractAddress(
    availableSmartContractAddresses: ProtocolAddresses,
    tokenSymbol: TokenSymbol
  ): string {
    if (tokenSymbol === TokenSymbol.ETH) {
      tokenSymbol = TokenSymbol.WETH;
    }
    const address = availableSmartContractAddresses[tokenSymbol];
    if (!address) {
      console.warn('ERROR getting contract for ', tokenSymbol);
    }
    return address;
  }

  static getAddressLabel(
    info: IProviderUserInfo,
    contractAddress: string
  ): string {
    const tokenSymbol = AddressUtils.getAddressTokenSymbol(
      info,
      contractAddress
    );
    return AddressUtils.getTokenSymbolLabel(tokenSymbol);
  }

  static getTokenSymbolLabel(tokenSymbol: TokenSymbol): string {
    return tokenSymbol
      ? AddressUtils.labels[tokenSymbol] || tokenSymbol.toString()
      : '';
  }

  static getAddressTokenSymbol(
    info: IProviderUserInfo,
    tokenContractAddress
  ): TokenSymbol {
    const tokenSymbolStr = Object.keys(
      info.availableSmartContractAddresses
    ).find(
      (ts) =>
        tokenContractAddress.toLowerCase() ===
        info.availableSmartContractAddresses[ts].toLowerCase()
    );
    if (!TokenSymbol[tokenSymbolStr]) {
      console.warn(
        'ERROR resolving address to token symbol =',
        tokenContractAddress
      );
    }
    return TokenSymbol[tokenSymbolStr];
  }
}
