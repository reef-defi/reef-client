import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-binance-register-modal',
  templateUrl: './binance-register-modal.component.html',
  styleUrls: ['./binance-register-modal.component.scss'],
})
export class BinanceRegisterModalComponent {
  public email: string | undefined;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
