import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-custom-invest-modal',
  templateUrl: './custom-invest-modal.component.html',
  styleUrls: ['./custom-invest-modal.component.scss'],
})
export class CustomInvestModalComponent {
  public ethAmount = new FormControl(0);

  constructor(
    public dialogRef: MatDialogRef<CustomInvestModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onInvest(): number {
    return this.ethAmount.value;
  }
}
