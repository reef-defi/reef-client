import {Injectable} from '@angular/core';
import {IPendingTransactions, PendingTransaction, TransactionType} from "../models/types";
import {BehaviorSubject, Observable} from "rxjs";
import {ConnectorService} from "./connector.service";
import {first, map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  static readonly PENDING_TX_KEY = 'pending_txs';

  constructor(private readonly connectorService: ConnectorService) {
  }

  public pendingTransactions$ = new BehaviorSubject<IPendingTransactions>({
    transactions: [],
  });

  public getPendingTransactions(types: TransactionType[]): Observable<PendingTransaction[]> {
    return this.pendingTransactions$.pipe(
      map(({transactions}: IPendingTransactions) => transactions.filter(tx => types.includes(tx.type)))
    )
  }

  public addPendingTx(hash: string, type: TransactionType): void {
    const transactions = this.pendingTransactions$.value.transactions || [];
    const pendingTransactions: IPendingTransactions = {
      transactions: [...transactions, {hash, type}],
    };
    this.pendingTransactions$.next(pendingTransactions);
    localStorage.setItem(
      TransactionsService.PENDING_TX_KEY,
      JSON.stringify(pendingTransactions)
    );
  }

  public async initPendingTxs(txs: IPendingTransactions): Promise<void> {
    const web3 = await this.connectorService.web3$.pipe(first()).toPromise();
    for (const [i, tx] of txs.transactions.entries()) {
      const {blockHash, blockNumber} = await web3.eth.getTransaction(
        tx.hash
      );
      if (blockHash && blockNumber) {
        txs.transactions.splice(i, 1);
      }
    }
    localStorage.setItem(TransactionsService.PENDING_TX_KEY, JSON.stringify(txs));
    this.pendingTransactions$.next({
      transactions: txs.transactions,
    });
  }

  public removePendingTx(hash: string) {
    let {transactions} = this.pendingTransactions$.value;
    const txs = {
      transactions: transactions.filter((tx) => tx.hash !== hash),
    };
    localStorage.setItem(TransactionsService.PENDING_TX_KEY, JSON.stringify(txs));
    this.pendingTransactions$.next(txs);
  }

}
