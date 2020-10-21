import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContractService } from '../../../../core/services/contract.service';
import { first, take } from 'rxjs/operators';
import { ConnectorService } from '../../../../core/services/connector.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LiquidateModalComponent } from '../../components/liquidate-modal/liquidate-modal.component';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-baskets',
  templateUrl: './baskets.page.html',
  styleUrls: ['./baskets.page.scss']
})
export class BasketsPage implements OnInit, OnDestroy {
  readonly contract$ = this.contractService.contract$;
  readonly baskets$ = this.contractService.baskets$;
  readonly basketsError$ = this.contractService.basketsError$;
  readonly loading$ = this.contractService.loading$;
  public isList = new FormControl(true);

  constructor(
    private readonly contractService: ContractService,
    private readonly connectorService: ConnectorService,
    private router: Router,
    private readonly dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.contract$.pipe(
      first(ev => !!ev)
    ).subscribe(() => this.getAllBaskets());
  }

  ngOnDestroy(): void {
    this.contractService.resetBaskets();
  }

  onDisinvest(data: number[][]): void {
    const dialogRef = this.openDialog(data);
    dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {
          this.disinvest(result);
        }
      });
  }

  goToCreate(): void {
    this.router.navigate(['baskets/create-basket']);
  }

  private disinvest(data: any): void {
    this.contractService.disinvestInBasket(data[0], data[1], data[2]);
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