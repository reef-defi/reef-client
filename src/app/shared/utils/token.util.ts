import {TokenSymbol} from '../../core/models/types';
import BigNumber from 'bignumber.js';
import {roundDownTo} from '../../core/utils/math-utils';

const symbolDisplayMaxDecimals = {
  [TokenSymbol.ETH]: 4,
  [TokenSymbol.WETH]: 4,
  [TokenSymbol.REEF]: 0,
  [TokenSymbol.USDT]: 2,
  [TokenSymbol.REEF_USDT_POOL]: 4,
  [TokenSymbol.REEF_WETH_POOL]: 4,
};

const non18DecimalPlaces = {
  [TokenSymbol.USDT]: 6,
};

export class TokenUtil {

  static toMaxDisplayDecimalPlaces(value: number | string, tokenSymbol: TokenSymbol): number {
    if (typeof value === 'string') {
      value = (new BigNumber(value, 10)).toNumber();
    }
    const maxDecimals = TokenUtil.getMaxDecimalsDisplayNr(tokenSymbol);
    /*const num = (new BigNumber(value)).toFixed();
    const splitDecimals = num.split('.');
    if (splitDecimals.length === 2 && !!splitDecimals[1].length) {
      return parseFloat(splitDecimals[0] + '.' + splitDecimals[1].slice(0, maxDecimals));
    }
    return value;*/
    return roundDownTo(value, maxDecimals);
  }

  static toContractIntegerBalanceValue(fixedFloatNrValue: number, tokenSymbol: TokenSymbol): string {
    let exponent = non18DecimalPlaces[tokenSymbol];
    if (!exponent) {
      exponent = 18;
    }
    return (fixedFloatNrValue * Math.pow(10, exponent)).toString(10);
  }

  static toDisplayDecimalValue(contractIntegerBalanceValue: number, tokenSymbol: TokenSymbol): string {
    let exponent = non18DecimalPlaces[tokenSymbol];
    if (!exponent) {
      exponent = 18;
    }
    return (contractIntegerBalanceValue / Math.pow(10, exponent)).toString(10);
  }

  private static getMaxDecimalsDisplayNr(tokenSymbol: TokenSymbol): number {
    const decimalPlaces = symbolDisplayMaxDecimals[tokenSymbol];
    if (decimalPlaces == null && !!TokenSymbol[tokenSymbol]) {
      console.log('WARNING decimal places not set for ', tokenSymbol);
      return 2;
    }
    return decimalPlaces != null ? decimalPlaces : 2;
  }

}
