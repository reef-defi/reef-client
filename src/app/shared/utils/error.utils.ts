import { EErrorTypes, RpcErrorTypes } from '../../core/models/types';

export class ErrorUtils {
  private static JSON_RPC_ERROR_TYPES: RpcErrorTypes = {
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

  public static parseError(errorCode: EErrorTypes): string {
    if (!(errorCode in this.JSON_RPC_ERROR_TYPES)) {
      return 'Something went wrong. The transaction has been cancelled.';
    }
    return this.JSON_RPC_ERROR_TYPES[errorCode];
  }
}
