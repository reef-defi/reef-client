import {Component} from '@angular/core';
import {ConnectorService} from "../../../../core/services/connector.service";
import {ApiService} from "../../../../core/services/api.service";
import {UniswapService} from "../../../../core/services/uniswap.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {
  readonly selectedGas$ = this.connectorService.selectedGasPrice$;
  readonly gasPrices$ = this.apiService.getGasPrices();
  readonly slippagePercent$ = this.uniswapService.slippagePercent$;

  constructor(private readonly connectorService: ConnectorService,
              private readonly apiService: ApiService,
              private readonly uniswapService: UniswapService) {
  }

  public setGas(type: string, price: number): void {
    this.connectorService.setSelectedGas(type, price);
  }

  public setSlippage(percent: string): void {
    this.slippagePercent$.next(percent);
  }
}
