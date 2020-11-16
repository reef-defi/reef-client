import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ContractService } from '../../../../core/services/contract.service';
import { first, take } from 'rxjs/operators';
import { ConnectorService } from '../../../../core/services/connector.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LiquidateModalComponent } from '../../components/liquidate-modal/liquidate-modal.component';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { VaultsService } from '../../../../core/services/vaults.service';
import { BehaviorSubject } from 'rxjs';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { IVaultBasket } from '../../../../core/models/types';
import { ApiService } from '../../../../core/services/api.service';

@Component({
  selector: 'app-baskets',
  templateUrl: './baskets.page.html',
  styleUrls: ['./baskets.page.scss']
})
export class BasketsPage implements OnInit, OnDestroy, AfterViewInit {
  readonly contract$ = this.contractService.basketContract$;
  readonly vaultsContract$ = this.connectorService.vaultsContract$;
  readonly baskets$ = this.contractService.baskets$;
  readonly vaults$ = new BehaviorSubject<IVaultBasket[]>(null);
  readonly basketsError$ = this.contractService.basketsError$;
  readonly loading$ = this.contractService.loading$;
  public isList = new FormControl(true);

  constructor(
    private readonly contractService: ContractService,
    private readonly connectorService: ConnectorService,
    private readonly vaultsService: VaultsService,
    private readonly apiService: ApiService,
    private readonly dialog: MatDialog,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    combineLatest(this.contract$, this.vaultsContract$).pipe(
      first(([a, b]) => !!a && !!b)
    ).subscribe(() => {
      this.getAllBaskets();
      this.getVaultsBaskets();
    });
  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    this.contractService.resetBaskets();
  }

  onDisinvest(data: number[], type: 'vault' | 'pool'): void {
    const dialogRef = this.openDialog(data);
    dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {
          type === 'vault' ? this.disinvestVaultBasket(result) : this.disinvestBasket(result);
        }
      });
  }

  goToCreate(): void {
    this.router.navigate(['baskets/create-basket']);
  }

  private disinvestBasket(data: any): void {
    this.contractService.disinvestInBasket(data[0], data[1], data[2], data[3]);
  }

  private async disinvestVaultBasket(data: any): Promise<void> {
    console.log(data, 'DISINVEST')
    await this.vaultsService.disinvestFromVaults(data[0], data[1], data[2], data[3]);
    await this.getVaultsBaskets();
  }

  private async getVaultsBaskets(): Promise<any> {
    const vaults = await this.vaultsService.getBasketVaults();
    this.vaults$.next(vaults);
  }

  async getAllBaskets(): Promise<any> {
    await this.contractService.getAllBaskets();
  }

  private openDialog(data: any): MatDialogRef<LiquidateModalComponent> {
    return this.dialog.open(LiquidateModalComponent, {
      data: {
        data,
      }
    });
  }
}
