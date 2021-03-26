import { Injectable } from '@angular/core';
import {
  ChainId,
  IPendingTransactions,
  PendingTransaction,
  TokenSymbol,
  TransactionType,
} from '../models/types';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConnectorService } from './connector.service';
import { first, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { TokenBalanceService } from '../../shared/service/token-balance.service';
import { getChainData } from '../utils/chains';

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
    [TransactionType.REEF_BASKET]: [ChainId.MAINNET],
  };
  private static TRANSACTION_SCANNERS = {
    [ChainId.MAINNET]: {
      name: 'EtherScan',
      url: 'https://etherscan.io/tx',
    },
    [ChainId.BINANCE_SMART_CHAIN]: {
      name: 'BSCScan',
      url: 'https://bscscan.com/tx',
    },
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
    const txUrl = `${TransactionsService.TRANSACTION_SCANNERS[chainId].url}/${hash}`;
    const transactions = this.pendingTransactions$.value.transactions || [];
    const pendingTransactions: IPendingTransactions = {
      transactions: [
        ...transactions,
        {
          hash,
          type,
          tokens,
          txUrl,
          scanner: TransactionsService.TRANSACTION_SCANNERS[chainId].name,
          chainId,
        },
      ],
    };
    this.pendingTransactions$.next(pendingTransactions);
    localStorage.setItem(
      TransactionsService.PENDING_TX_KEY,
      JSON.stringify(pendingTransactions)
    );
  }

  public async initPendingTxs(txs: IPendingTransactions): Promise<void> {
    const web3 = await this.connectorService.web3$.pipe(first()).toPromise();
    const info = await this.connectorService.providerUserInfo$
      .pipe(first())
      .toPromise();
    for (const [i, tx] of txs.transactions.entries()) {
      if (tx.chainId === info.chainInfo.chain_id) {
        const { blockHash, blockNumber } = await web3.eth.getTransaction(
          tx.hash
        );
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
    if (!isError) {
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
}
