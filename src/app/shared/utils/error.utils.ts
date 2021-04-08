import {BASKET_POS_ERR_TYPES, BasketPositionError, EErrorTypes, RpcErrorTypes} from '../../core/models/types';

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
    /*if (message) {
      const maxRatio = message.indexOf('ERR_MAX_IN_RATIO') > -1;
      const minRatio = message.indexOf('ERR_MIN_IN_RATIO') > -1;
      if (maxRatio || minRatio) {
        return `Investment value(s) of Balancer pool position(s) in basket are ${
          maxRatio ? 'too big' : 'too small'
        }.`;
      }
    }*/
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

  public static parseBasketPositionError(message: string): BasketPositionError {
    // `///R_ERRORS|POS_TYPE=BAL_POOL, |IDENT_1=0x2345345 |IDENT_2=0x45645///R_ERRORS`;

    const reefErrorsIdent = '///R_ERRORS';
    if (message.indexOf(reefErrorsIdent) > -1) {
      const openErrIndex = message.indexOf(reefErrorsIdent, 0) + reefErrorsIdent.length;
      const closeErrIndex = message.indexOf(reefErrorsIdent, openErrIndex);
      const reefErrStr = message.substring(openErrIndex, closeErrIndex);
      if (reefErrStr) {
        const errorVals = reefErrStr.split('|')
          .map(eStr => eStr.split('='));
        const posType = errorVals.find(eArr => eArr[0] === 'POS_TYPE');
        if (posType) {
          const posTypeVal = posType[1].trim();
          switch (posTypeVal) {
            case BASKET_POS_ERR_TYPES.BAL_POOL:
              return {type: posTypeVal, positionIdent: ErrorUtils.getIdentValue(errorVals, 1)};
            case BASKET_POS_ERR_TYPES.TOKEN:
              return {type: posTypeVal, positionIdent: ErrorUtils.getIdentValue(errorVals, 1)};
            case BASKET_POS_ERR_TYPES.UNI_POOL_v2:
              return {
                type: posTypeVal,
                positionIdent: ErrorUtils.getIdentValue(errorVals, 1) + '_' + ErrorUtils.getIdentValue(errorVals, 2)
              };
            case BASKET_POS_ERR_TYPES.MOONI_POOL:
              return {type: posTypeVal, positionIdent: ErrorUtils.getIdentValue(errorVals, 1)};
          }
        }
      }
    }
    return null;
  }

  private static getIdentValue(errorVals: string[][], identNr: number): string {
    const val = errorVals.find(eArr => eArr[0] === 'IDENT_' + identNr)[1];
    return val ? val.trim() : null;
  }
}

