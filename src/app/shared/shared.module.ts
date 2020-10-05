import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NotificationComponent } from './components/notification/notification.component';
import { RouterModule } from '@angular/router';
import { FilterPipe } from './pipes/filter.pipe';
import { MatSliderModule } from '@angular/material/slider';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from './components/loading/loading.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatIconModule } from '@angular/material/icon';
import { AddressShortenerComponent } from './components/address-shortener/address-shortener.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ContentBoxComponent } from './components/content-box/content-box.component';

const components = [
  FooterComponent, HeaderComponent, SidebarComponent, NotificationComponent, LoadingComponent, AddressShortenerComponent,
  ContentBoxComponent,
];
const directives = [];
const pipes = [FilterPipe];
const modules = [
  MatSliderModule, MatSnackBarModule, MatButtonModule, MatProgressSpinnerModule, MatCardModule, NgApexchartsModule, MatIconModule,
  MatTooltipModule, ClipboardModule,
];

@NgModule({
  declarations: [...components, ...directives, ...pipes,],
  providers: [{
    provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 4000, verticalPosition: 'top', horizontalPosition: 'right'},
  }],
  imports: [
    CommonModule,
    RouterModule,
    ...modules,
  ],
  exports: [...components, ...directives, ...pipes, ...modules, RouterModule],
})
export class SharedModule {
}
