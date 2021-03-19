import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-price-not-supported-dialog',
  templateUrl: './price-not-supported-dialog.component.html',
})
export class PriceNotSupportedDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<PriceNotSupportedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
