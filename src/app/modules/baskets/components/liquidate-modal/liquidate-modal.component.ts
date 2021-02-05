import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-liquidate-modal',
  templateUrl: './liquidate-modal.component.html',
  styleUrls: ['./liquidate-modal.component.scss'],
})
export class LiquidateModalComponent {
  public percentage = new FormControl(0);
  public isReefStake = new FormControl(false);
  constructor(
    public dialogRef: MatDialogRef<LiquidateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onLiquidate(): any {
    return [...this.data.data, this.percentage.value, this.isReefStake.value];
  }
}
