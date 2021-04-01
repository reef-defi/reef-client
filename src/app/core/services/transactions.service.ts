import { Injectable } from '@angular/core';
import {
  ChainId,
  IChainData,
  IPendingTransactions,
  PendingTransaction,
  TokenSymbol,
  TransactionType,
} from '../models/types';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConnectorService } from './connector.service';
import { catchError, first, map, take } from 'rxjs/operators';
import { ApiService } from './api.service';
import { TokenBalanceService } from '../../shared/service/token-balance.service';
import { getChainData } from '../utils/chains';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs/internal/observable/of';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  static readonly PENDING_TX_KEY = 'pending_txs';
  private static SUPPORTED_CHAIN_TRANSACTIONS = {
    [TransactionType.BUY_REEF]: [ChainId.MAINNET],
    [TransactionType.REEF_BOND]: [ChainId.MAINNET, ChainId.BINANCE_SMART_CHAIN],
    [TransactionType.LIQUIDITY_USDT]: [ChainId.MAINNET],
    [TransactionType.LIQUIDITY_ETH]: [ChainId.MAINNET],
    [TransactionType.REEF_FARM]: [ChainId.MAINNET],
    [TransactionType.REEF_ETH_FARM]: [ChainId.MAINNET],
    [TransactionType.REEF_USDT_FARM]: [ChainId.MAINNET],
    [TransactionType.REEF_BASKET]: [ChainId.MAINNET, ChainId.LOCAL_FORK],
  };

  public pendingTransactions$ = new BehaviorSubject<IPendingTransactions>({
    transactions: [],
  });

  static checkIfTransactionSupported(
    transactionType: TransactionType,
    chainId: ChainId
  ): boolean {
    return this.SUPPORTED_CHAIN_TRANSACTIONS[transactionType].includes(chainId);
  }

  constructor(
    private readonly connectorService: ConnectorService,
    private apiService: ApiService,
    private http: HttpClient,
    public tokenBalanceService: TokenBalanceService
  ) {}

  public getPendingTransactions(
    types: TransactionType[]
  ): Observable<PendingTransaction[]> {
    return this.pendingTransactions$.pipe(
      map(({ transactions }: IPendingTransactions) =>
        transactions.filter((tx) => types.includes(tx.type))
      )
    );
  }

  public addPendingTx(
    hash: string,
    type: TransactionType,
    tokens: TokenSymbol[],
    chainId: ChainId
  ): void {
    const transactions = this.pendingTransactions$.value.transactions || [];
    if (!hash || transactions.find((tx) => tx.hash === hash)) {
      return;
    }
    this.connectorService.providerUserInfo$.pipe(take(1)).subscribe((info) => {
      const txUrl = info.chainInfo.chain_scanner_base_url
        ? `${info.chainInfo.chain_scanner_base_url}/tx/${hash}`
        : '';
      const pendingTransactions: IPendingTransactions = {
        transactions: [
          ...transactions,
          {
            hash,
            type,
            tokens,
            txUrl,
            scanner: info.chainInfo.chain_scanner_name
              ? info.chainInfo.chain_scanner_name
              : info.chainInfo.name,
            chainId,
          },
        ],
      };
      this.pendingTransactions$.next(pendingTransactions);
      localStorage.setItem(
        TransactionsService.PENDING_TX_KEY,
        JSON.stringify(pendingTransactions)
      );
    });
  }

  public async initPendingTxs(txs: IPendingTransactions): Promise<void> {
    const web3 = await this.connectorService.web3$.pipe(first()).toPromise();
    const info = await this.connectorService.providerUserInfo$
      .pipe(first())
      .toPromise();
    for (const [i, tx] of txs.transactions.entries()) {
      if (tx.chainId === info.chainInfo.chain_id && !!tx.hash) {
        const trx = await web3.eth.getTransaction(tx.hash);
        if (!trx) {
          const replacedByTxHash = await this.getReplacedTx$(
            tx.hash,
            info.chainInfo
          )
            .pipe(first())
            .toPromise();
          if (!!replacedByTxHash) {
            this.addPendingTx(replacedByTxHash, tx.type, tx.tokens, tx.chainId);
          }
          this.removePendingTx(tx.hash, false);
          continue;
        }
        const { blockHash, blockNumber } = trx;
        if (blockHash && blockNumber) {
          txs.transactions.splice(i, 1);
        }
      }
    }
    localStorage.setItem(
      TransactionsService.PENDING_TX_KEY,
      JSON.stringify(txs)
    );
    this.pendingTransactions$.next({
      transactions: txs.transactions,
    });
  }

  public removePendingTx(hash: string, isError = false): void {
    const { transactions } = this.pendingTransactions$.value;
    const removeTx = transactions.find((tx) => tx.hash === hash);
    if (!isError && removeTx) {
      this.tokenBalanceService.updateTokensInBalances.next([
        ...removeTx.tokens,
        TokenSymbol.ETH,
      ]);
    }
    const txs = {
      transactions: transactions.filter((tx) => tx.hash !== removeTx.hash),
    };
    localStorage.setItem(
      TransactionsService.PENDING_TX_KEY,
      JSON.stringify(txs)
    );
    this.pendingTransactions$.next(txs);
  }

  private getReplacedTx$(
    hash: string,
    chainData: IChainData
  ): Observable<string> {
    return this.http
      .post(environment.reefNodeApiUrl + '/replaced-tx', {
        chainId: chainData.chain_id,
        txHash: hash,
      })
      .pipe(
        map((res: { success: boolean; replacedTx: string }) => {
          return res && res.success ? res.replacedTx : null;
        }),
        catchError((err) => of(null))
      );
  }
}
