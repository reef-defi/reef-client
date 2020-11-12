import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IBasketHistoricRoi, IGenerateBasketRequest, IGenerateBasketResponse, IVaultBasket } from '../../../../core/models/types';
import { Subscription } from 'rxjs';
import { ChartsService } from '../../../../core/services/charts.service';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-vault',
  templateUrl: './vault.component.html',
  styleUrls: ['./vault.component.scss']
})
export class VaultComponent {
  private mVault: IVaultBasket | undefined;
  private payload: IGenerateBasketResponse | undefined;
  private disinvestPercentage = 100;
  @Input() set vault(val: IVaultBasket) {
    if (val) {
      this.mVault = val;
      this.payload = this.composeRoiPayload(val);
      this.getHistoricRoi(this.payload, 1);
    }
  }
  get vault(): IVaultBasket {
    return this.mVault;
  }
  @Input() vaultIndex: number | undefined;
  @Input() isListView: boolean | undefined;
  @Output() disinvest = new EventEmitter();

  constructor(private readonly chartsService: ChartsService,
              private readonly apiService: ApiService) {

  }
  public chartRoiData: number[][];
  public activeTimeSpan = 1;

  onDisinvest(): void {
    const data = [this.vaultIndex, this.disinvestPercentage];
    this.disinvest.emit(data);
  }

  public getHistoricRoi(basket: IGenerateBasketResponse, subtractMonths: number): Subscription {
    this.activeTimeSpan = subtractMonths;
    return this.apiService.getHistoricRoi(basket, subtractMonths).subscribe((historicRoi: IBasketHistoricRoi) => {
      this.chartRoiData = this.chartsService.composeHighChart(this.extractRoi(historicRoi));
    });
  }

  private extractRoi(obj: IBasketHistoricRoi): number[][] {
    return Object.keys(obj).map((key) => [new Date(key).getTime(), +obj[key].weighted_roi.toFixed(2)]);
  }

  private composeRoiPayload(vault: IVaultBasket): IGenerateBasketResponse {
    const names = vault.vaults.vaults.map(v => v.name);
    const weights = vault.vaults.weights;
    const payload = {};
    for (let i = 0; i < names.length; i++) {
      payload[names[i]] = weights[i];
    }
    return payload;
  }
}
