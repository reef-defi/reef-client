import { Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { PoolService } from '../../../../core/services/pool.service';
import { first } from 'rxjs/operators';
import { IProviderUserInfo, ITransaction } from '../../../../core/models/types';
import { Observable } from 'rxjs';
import { UniswapService } from '../../../../core/services/uniswap.service';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  Object = Object;
  readonly providerName$ = this.connectorService.currentProviderName$;
  readonly provider$ = this.connectorService.currentProvider$;
  readonly providerUserInfo$ = this.connectorService.providerUserInfo$;
  readonly ethPrice$ = this.poolService.getEthPrice();
  readonly slippagePercent$ = this.uniswapService.slippagePercent$;
  readonly transactionsForAccount$: Observable<ITransaction[]> =
    this.connectorService.transactionsForAccount$;
  readonly gasPrices$ = this.apiService.gasPrices$;
  readonly selectedGas$ = this.connectorService.selectedGasPrice$;
  public usdTBalance = null;
  public reefEthLpBalance = null;
  public reefUSDTLpBalance = null;

  constructor(private readonly connectorService: ConnectorService,
              private readonly poolService: PoolService,
              private readonly uniswapService: UniswapService,
              private readonly apiService: ApiService) {
  }

  ngOnInit(): void {
    this.providerUserInfo$.pipe(
      first(ev => !!ev)
    ).subscribe((res: IProviderUserInfo) => {
      this.getTransactionsForAccount(res.address);
      this.getTokenBalancesForAccount(res.address);
    });
  }

  public setSlippage(percent: string): void {
    this.uniswapService.setSlippage(percent);
  }

  public setGas(type: string, price: number): void {
    this.connectorService.setSelectedGas(type, price);
  }

  private async getTransactionsForAccount(address: string): Promise<void> {
    await this.connectorService.getTransactionsForAddress(address);
  }

  private async getTokenBalancesForAccount(address: string): Promise<any> {
    const usdToken = this.connectorService.createLpContract('USDT')
    const reefEthLP = this.connectorService.createLpContract('REEF_WETH_POOL');
    const reefUSDTLP = this.connectorService.createLpContract('REEF_USDT_POOL');
    this.reefEthLpBalance = await reefEthLP.methods.balanceOf(address).call();
    this.reefUSDTLpBalance = await reefUSDTLP.methods.balanceOf(address).call();
    this.usdTBalance = await usdToken.methods.balanceOf(address).call();
  }
}
