import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContractService } from '../../../../core/services/contract.service';
import { first, take } from 'rxjs/operators';
import { ConnectorService } from '../../../../core/services/connector.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LiquidateModalComponent } from '../../components/liquidate-modal/liquidate-modal.component';

@Component({
  selector: 'app-baskets',
  templateUrl: './baskets.page.html',
  styleUrls: ['./baskets.page.scss']
})
export class BasketsPage implements OnInit, OnDestroy {
  contract$ = this.contractService.contract$;
  baskets$ = this.contractService.baskets$;

  constructor(
    private readonly contractService: ContractService,
    private readonly connectorService: ConnectorService,
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

  private disinvest(data: any) {
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
