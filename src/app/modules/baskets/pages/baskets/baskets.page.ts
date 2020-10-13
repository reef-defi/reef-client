import { Component, OnInit } from '@angular/core';
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
export class BasketsPage implements OnInit {
  contract$ = this.contractService.contract$;
  baskets$ = this.contractService.baskets$;

  constructor(
    private readonly contractService: ContractService,
    private readonly connectorService: ConnectorService,
    private readonly dialog: MatDialog) {
  }

  ngOnInit(): void {
    if (this.contract$.value) {
      this.getAllBaskets();
    } else {
      this.connectorService.providerUserInfo$
        .pipe(first(ev => !!ev))
        .subscribe((data: any) => {
          if (data) {
            this.connectToContract();
            this.getAllBaskets();
          }
        });
    }
  }

  onBasketInvest(basketInfo: any): void {
    console.log(basketInfo);
    const {basketIdx, weights, name} = basketInfo;
    this.contractService.investInBasket([0, 1], [50, 50], 1);
  }

  onDisinvest(data: number[][]): void {
    const dialogRef = this.openDialog(data);
    dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        this.disinvest(result);
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

  private connectToContract(): void {
    this.contractService.connectToContract();
  }
}
