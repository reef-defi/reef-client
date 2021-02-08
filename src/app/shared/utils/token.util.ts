import { TokenSymbol, TransactionType } from '../../core/models/types';
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
  static toMaxDisplayDecimalPlaces(
    value: number | string,
    tokenSymbol: TokenSymbol,
    maxDecimalPlaces?: number
  ): number {
    if (typeof value === 'string') {
      value = new BigNumber(value, 10).toNumber();
    }
    const maxDecimals =
      maxDecimalPlaces != null
        ? maxDecimalPlaces
        : TokenUtil.getMaxDecimalsDisplayNr(tokenSymbol);
    return roundDownTo(value, maxDecimals);
  }

  static toContractIntegerBalanceValue(
    fixedFloatNrValue: number,
    tokenSymbol: TokenSymbol
  ): string {
    let exponent = non18DecimalPlaces[tokenSymbol];
    if (!exponent) {
      exponent = 18;
    }
    const val = new BigNumber(`${fixedFloatNrValue}e+${exponent}`);
    const fixedVal = val.toFixed();
    const decimalIndex = fixedVal.indexOf('.');
    return decimalIndex > -1 ? fixedVal.substring(0, decimalIndex) : fixedVal;
  }

  static toDisplayDecimalValue(
    contractIntegerBalanceValue: number,
    tokenSymbol?: TokenSymbol
  ): string {
    let exponent = non18DecimalPlaces[tokenSymbol];
    if (!exponent) {
      exponent = 18;
    }
    return (contractIntegerBalanceValue / Math.pow(10, exponent)).toString(10);
  }

  public static parseLPTokenName(
    tokenSymbol: TokenSymbol | string
  ): TokenSymbol | string {
    if (
      tokenSymbol === TokenSymbol.REEF_USDT_POOL ||
      tokenSymbol === TokenSymbol.REEF_WETH_POOL
    ) {
      const symbol = tokenSymbol.split('_').slice(0, 2).join('-');
      return symbol;
    }
    return tokenSymbol;
  }

  public static getTransactionTypeByTokenName(
    tokenSymbol: TokenSymbol
  ): TransactionType {
    switch (tokenSymbol) {
      case TokenSymbol.REEF_USDT_POOL:
        return TransactionType.REEF_USDT_FARM;
      case TokenSymbol.REEF_WETH_POOL:
        return TransactionType.REEF_ETH_FARM;
      case TokenSymbol.REEF:
        return TransactionType.REEF_FARM;
      default:
        return TransactionType.REEF_FARM;
    }
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
