import {TokenSymbol} from '../../core/models/types';
import BigNumber from 'bignumber.js';
import {roundDownTo} from '../../core/utils/math-utils';

const symbolDecimals = {
  [TokenSymbol.ETH]: 4,
  [TokenSymbol.WETH]: 4,
  [TokenSymbol.REEF]: 0,
  [TokenSymbol.USDT]: 2,
  [TokenSymbol.REEF_USDT_POOL]: 4,
  [TokenSymbol.REEF_WETH_POOL]: 4,
};

export class TokenUtil {

  static toMaxDecimalPlaces(value: number | string, tokenSymbol: TokenSymbol): number {
    if (typeof value === 'string') {
      value = (new BigNumber(value, 10)).toNumber();
    }
    const maxDecimals = TokenUtil.getDecimalPlaces(tokenSymbol);
    /*const num = (new BigNumber(value)).toFixed();
    const splitDecimals = num.split('.');
    if (splitDecimals.length === 2 && !!splitDecimals[1].length) {
      return parseFloat(splitDecimals[0] + '.' + splitDecimals[1].slice(0, maxDecimals));
    }
    return value;*/
    return roundDownTo(value, maxDecimals);
  }

  private static getDecimalPlaces(tokenSymbol: TokenSymbol): number {
    const decimalPlaces = symbolDecimals[tokenSymbol];
    if (decimalPlaces == null && !!TokenSymbol[tokenSymbol]) {
      console.log('WARNING decimal places not set for ', tokenSymbol);
      return 2;
    }
    return decimalPlaces != null ? decimalPlaces : 2;
  }

}
