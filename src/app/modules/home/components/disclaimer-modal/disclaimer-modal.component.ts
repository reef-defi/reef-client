import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-disclaimer-modal',
  templateUrl: './disclaimer-modal.component.html',
  styleUrls: ['./disclaimer-modal.component.scss'],
})
export class DisclaimerModalComponent {
  constructor(public dialogRef: MatDialogRef<DisclaimerModalComponent>) {}

  action(state: boolean): void {
    this.dialogRef.close(state);
  }
}
