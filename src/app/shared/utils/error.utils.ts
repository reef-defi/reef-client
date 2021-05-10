import { EErrorTypes, RpcErrorTypes } from '../../core/models/types';

export class ErrorUtils {
  private static JSON_RPC_ERROR_TYPES: any = {
    [EErrorTypes.USER_CANCELLED]: 'You have cancelled the transaction.',
    [EErrorTypes.INTERNAL_ERROR]:
      'Transaction failed. Something went wrong internally.',
    [EErrorTypes.INVALID_PARAMS]:
      'Transaction failed. Try again, and contact our support with code: 32602.',
    [EErrorTypes.METHOD_NOT_FOUND]:
      'The transaction you were trying to execute was unsuccessful.',
    [EErrorTypes.INVALID_REQUEST]:
      'Transaction failed. This is probably our fault. Contact our support with code: -32600',
    [EErrorTypes.PARSE_ERROR]:
      'Transaction failed. This is probably our fault. Contact our support with code: -32700',
  };

  public static parseError(errorCode: EErrorTypes, message?: string): string {
    if (message) {
      const maxRatio = message.indexOf('ERR_MAX_IN_RATIO') > -1;
      const minRatio = message.indexOf('ERR_MIN_IN_RATIO') > -1;
      if (maxRatio || minRatio) {
        return `Investment value(s) of Balancer pool position(s) in basket are ${
          maxRatio ? 'too big' : 'too small'
        }.`;
      }
    }
    if (!!this.JSON_RPC_ERROR_TYPES[errorCode]) {
      return this.JSON_RPC_ERROR_TYPES[errorCode];
    }
    if (errorCode === EErrorTypes.BASKET_POSITION_INVEST_ERROR) {
      return (
        'Some basket position(s) experienced error investing. ' +
        'None of your funds were invested. Please update positions and try again.'
      );
    }
    return 'Something went wrong. The transaction has been cancelled.';
  }
}
