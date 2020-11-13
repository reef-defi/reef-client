import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { FormControl } from '@angular/forms';
import { IBasketHistoricRoi, IVault } from '../../../../core/models/types';
import { ConnectorService } from '../../../../core/services/connector.service';
import { VaultsService } from '../../../../core/services/vaults.service';
import { take } from 'rxjs/operators';
import { ChartsService } from '../../../../core/services/charts.service';

@Component({
  selector: 'app-vaults',
  templateUrl: './vaults.page.html',
  styleUrls: ['./vaults.page.scss']
})
export class VaultsPage implements OnInit {
  readonly vaults$ = this.apiService.vaults$;
  readonly ethAmount = new FormControl(0);
  readonly userInfo = this.connectorService.providerUserInfo$;
  public currentVaults: IVault = {};
  public vaults = {};
  public vaultRoiChart = null;
  public chartMonthsSpan = 1;

  constructor(
    private readonly apiService: ApiService,
    private readonly connectorService: ConnectorService,
    private readonly vaultsService: VaultsService,
    private readonly chartsService: ChartsService) {
  }

  ngOnInit(): void {
    this.vaults$
      .pipe(take(1))
      .subscribe((vaults: IVault) => {
        this.vaults = vaults;
        this.currentVaults = Object.keys(this.vaults).slice(0, 3).reduce((memo, curr) => ({
          ...memo,
          [curr]: {
            ...this.vaults[curr],
            percentage: Math.round(100 / 3),
          },
        }), {});
        this.setChart();
      });
  }

  onInvest(): void {
    const types = this.getVaultType(this.currentVaults);
    const vaults = Object.values(this.currentVaults).map(val => val.address);
    const vaultsWeights = Object.values(this.currentVaults).map(val => val.percentage);
    console.log(types, vaults, vaultsWeights);
    this.vaultsService.createBasketVaults(vaults, vaultsWeights, types, this.ethAmount.value);
  }

  onDiversifyChange(amount: number): void {
    const vaults = Object.keys(this.vaults).slice(0, amount).reduce((memo, curr) => ({
      ...memo,
      [curr]: this.vaults[curr],
    }), {});
    this.currentVaults = this.getVaultPercentage(vaults);
    this.setChart(this.chartMonthsSpan);
  }

  onPercentageChange(val: number): void {
    this.ethAmount.patchValue(val);
  }

  editVaultAlloc([name, percentage]): void {
    const oldValue = this.currentVaults[name].percentage || 0;
    const newValue = this.currentVaults[name].percentage = percentage;
    const remainder = 100 - oldValue;
    const diff = newValue - oldValue;
    const multiplier = (remainder - diff) / remainder;
    for (const key in this.currentVaults) {
      if (key !== name) {
        this.currentVaults[key].percentage = Math.round(this.currentVaults[key].percentage * multiplier);
      }
    }
    this.setChart(this.chartMonthsSpan);
  }

  setChart(subtractMonths: number = 1): void {
    this.chartMonthsSpan = subtractMonths;
    const payload = Object.keys(this.currentVaults).reduce((memo, curr) => ({
      ...memo,
      [curr]: +this.currentVaults[curr].percentage
    }), {});
    this.apiService.getHistoricRoi(payload, this.chartMonthsSpan)
      .pipe(take(1))
      .subscribe(data => {
        this.vaultRoiChart = this.chartsService.composeHighChart(this.extractRoi(data));
      });
  }

  private getVaultPercentage(vaults: IVault): IVault {
    const ln = Object.keys(vaults).length;
    return Object.keys(vaults).reduce((memo, curr) => ({
      ...memo,
      [curr]: {
        ...vaults[curr],
        percentage: Math.round(100 / ln),
      }
    }), {});
  }

  private getVaultType(currentVaults: IVault): number[] {
    const vaultNames = Object.keys(currentVaults);
    return vaultNames.map((name: string) => {
      const arr = name.split(' ');
      if (arr[1].startsWith('a')) {
        return 1;
      }
      if (arr[1].startsWith('curve')) {
        return 2;
      } else {
        return 0;
      }
    });
  }

  private extractRoi(obj: IBasketHistoricRoi): number[][] {
    return Object.keys(obj).map((key) => [new Date(key).getTime(), +obj[key].weighted_roi.toFixed(2)]);
  }

}
