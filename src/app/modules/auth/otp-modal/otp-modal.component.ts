import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-otp-modal',
  templateUrl: './otp-modal.component.html',
  styleUrls: ['./otp-modal.component.scss']
})
export class OtpModalComponent {

  title: any;
  message: any;
  secretUrl: string;

  constructor(
    public dialogRef: MatDialogRef<OtpModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  login(password): void {
    console.log('PP', password);
  }

  action(state: boolean): void {
    this.dialogRef.close(state);
  }

}
