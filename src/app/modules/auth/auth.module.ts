import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginBtnComponent } from './components/login-btn/login-btn.component';
import { OtpModalComponent } from './components/otp-modal/otp-modal.component';
import { QrCodeModule } from 'ng-qrcode';

@NgModule({
  declarations: [LoginBtnComponent, OtpModalComponent],
  exports: [LoginBtnComponent],
  imports: [CommonModule, QrCodeModule],
})
export class AuthModule {}
