import {Component, OnInit} from '@angular/core';
import {ConnectorService} from './core/services/connector.service';
import {PoolService} from './core/services/pool.service';
import {ApiService} from './core/services/api.service';
import {ContractService} from './core/services/contract.service';
import {Router} from '@angular/router';
import {filter, take} from 'rxjs/operators';
import {UniswapService} from './core/services/uniswap.service';
import {switchMap} from 'rxjs/internal/operators/switchMap';
import {combineLatest, Observable} from 'rxjs';
import {tap} from 'rxjs/internal/operators/tap';
import {IPendingTransactions} from "./core/models/types";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  readonly PENDING_TX_KEY = 'pending_txs'
  readonly VERSION = '0.2.3';
  providerName$ = this.connectorService.currentProviderName$;
  providerUserInfo$ = this.connectorService.providerUserInfo$;
  readonly providerLoading$ = this.connectorService.providerLoading$;
  public canEnter = false;

  constructor(
    public readonly poolService: PoolService,
    private readonly connectorService: ConnectorService,
    private readonly apiService: ApiService,
    private readonly contractService: ContractService,
    private readonly router: Router,
    private readonly uniswapService: UniswapService) {
    if (localStorage.getItem('demo_pw') === 'open sesame') {
      this.canEnter = true;
    } else {
      const pw = prompt('Welcome to Reef!');
      if (pw === 'open sesame') {
        this.canEnter = true;
        localStorage.setItem('demo_pw', 'open sesame');
      }
    }
  }

  ngOnInit(): void {
    this.prefetchData();
  }

  private prefetchData(): void {
    const initGas$ = this.apiService.getGasPrices().pipe(
      take(1)
    ).pipe(tap(data => {
        this.apiService.gasPrices$.next(data);
        const gasPrice = localStorage.getItem('reef_gas_price');
        if (gasPrice) {
          const gp = JSON.parse(gasPrice);
          this.connectorService.setSelectedGas(gp.type, gp.price);
        } else {
          this.connectorService.setSelectedGas('standard', data.standard);
        }
      })
    );
    combineLatest([
      this.initAddressBalances$(),
      this.uniswapService.initPrices$,
      this.poolService.ethPrice$,
      initGas$
    ]).pipe(
      take(1)
    ).subscribe(data => {
      this.checkPendingTransactions()
    });
  }

  private initAddressBalances$(): Observable<any> {
    return this.connectorService.providerUserInfo$.pipe(
      filter(v => !!v),
      switchMap(uInfo => this.apiService.getTokenBalances$(uInfo.address))
    );
  }

  private checkPendingTransactions() {
    const pendingTxs: IPendingTransactions = JSON.parse(localStorage.getItem(ConnectorService.PENDING_TX_KEY));
    if (pendingTxs.transactions.length > 0) {
      this.connectorService.initPendingTxs(pendingTxs)
      setInterval(() => {
        this.connectorService.initPendingTxs(pendingTxs)
      }, 5000)
    }
  }

  async onSignOut(): Promise<void> {
    await this.connectorService.onDisconnect();
    window.location.reload();
  }

}
