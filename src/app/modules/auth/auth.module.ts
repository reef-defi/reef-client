import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginBtnComponent } from './login-btn/login-btn.component';
import { OtpModalComponent } from './otp-modal/otp-modal.component';
import {QrCodeModule} from 'ng-qrcode';

@NgModule({
  declarations: [LoginBtnComponent, OtpModalComponent],
  exports: [LoginBtnComponent],
  imports: [CommonModule, QrCodeModule],
})
export class AuthModule {}
