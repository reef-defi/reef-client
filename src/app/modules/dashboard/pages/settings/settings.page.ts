import { Component } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';
import { ApiService } from '../../../../core/services/api.service';
import { UniswapService } from '../../../../core/services/uniswap.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  Object = Object;
  readonly selectedGas$ = this.connectorService.selectedGasPrice$;
  readonly gasPrices$ = this.apiService.getGasPrices();

  constructor(
    readonly uniswapService: UniswapService,
    private readonly connectorService: ConnectorService,
    private readonly apiService: ApiService
  ) {}

  public setGas(type: string, price: number): void {
    this.connectorService.setSelectedGas(type, price);
  }
}
