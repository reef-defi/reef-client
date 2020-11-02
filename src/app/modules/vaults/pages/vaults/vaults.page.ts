import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';
import { FormControl } from '@angular/forms';
import { IVault } from '../../../../core/models/types';
import { ConnectorService } from '../../../../core/services/connector.service';

@Component({
  selector: 'app-vaults',
  templateUrl: './vaults.page.html',
  styleUrls: ['./vaults.page.scss']
})
export class VaultsPage implements OnInit {
  readonly vaults$ = this.apiService.getVaults();
  readonly ethAmount = new FormControl(0);
  readonly diversifyAmount = new FormControl(3);
  readonly userInfo = this.connectorService.providerUserInfo$;
  public currentVaults: IVault = {};
  public vaults = {};

  constructor(
    private readonly apiService: ApiService,
    private readonly connectorService: ConnectorService) {
  }

  ngOnInit(): void {
    this.vaults$.subscribe((vaults: IVault) => {
      this.vaults = vaults;
      this.currentVaults = Object.keys(this.vaults).slice(0, 3).reduce((memo, curr) => ({
        ...memo,
        [curr]: {
          ...this.vaults[curr],
          percentage: Math.round(100 / 3),
        },
      }), {});
    });
  }

  onInvest(): void {
    console.log(this.ethAmount.value, this.diversifyAmount.value);
  }

  onDiversifyChange(amount: number): void {
    const vaults = Object.keys(this.vaults).slice(0, amount).reduce((memo, curr) => ({
      ...memo,
      [curr]: this.vaults[curr],
    }), {});
    this.currentVaults = this.getVaultPercentage(vaults);
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
        this.currentVaults[key].percentage = +(this.currentVaults[key].percentage * multiplier).toFixed(2);
      }
    }
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

}
