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
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ContentBoxComponent } from './components/content-box/content-box.component';
import { ButtonComponent } from './components/button/button.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { MatSelectModule } from '@angular/material/select';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { NumberCounterComponent } from './components/number-counter/number-counter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SkeletonLoadingComponent } from './components/skeleton-loading/skeleton-loading.component';
import { PercentageButtonsComponent } from './components/percentage-buttons/percentage-buttons.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatRippleModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { SvgIconComponent } from './components/svg-icon/svg-icon.component';
import { PageTitleComponent } from './components/page-title/page-title.component';
import { TransactionConfirmationComponent } from './components/transaction-confirmation/transaction-confirmation.component';
import { SetInputRelativeAmountComponent } from './components/set-input-relative-amount/set-input-relative-amount.component';
import {SmallNumberPipe} from './pipes/small-number-display.pipe';
import { ExceededBalanceMsgComponent } from './components/exceeded-balance-msg/exceeded-balance-msg.component';


const components = [
  FooterComponent, HeaderComponent, SidebarComponent, NotificationComponent, LoadingComponent, AddressShortenerComponent,
  ContentBoxComponent, ButtonComponent, EmptyStateComponent, NumberCounterComponent, SkeletonLoadingComponent,
  PercentageButtonsComponent,
];
const directives = [];
const pipes = [FilterPipe];
const modules = [
  CommonModule,
  RouterModule,
  ReactiveFormsModule,
  FormsModule,
  MatSliderModule, MatSnackBarModule, MatButtonModule, MatProgressSpinnerModule, MatCardModule, NgApexchartsModule, MatIconModule,
  MatTooltipModule, MatDialogModule, ClipboardModule, MatSlideToggleModule, ScrollingModule, MatTableModule, MatPaginatorModule,
  MatChipsModule, MatProgressBarModule, MatSelectModule, HighchartsChartModule, MatDividerModule, MatMenuModule, NgxSkeletonLoaderModule,
  MatRadioModule, MatRippleModule, MatListModule,
];

@NgModule({
  declarations: [...components, ...directives, ...pipes, SvgIconComponent, PageTitleComponent, TransactionConfirmationComponent, SetInputRelativeAmountComponent, SmallNumberPipe, ExceededBalanceMsgComponent],
  providers: [{
    provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 4000, verticalPosition: 'top', horizontalPosition: 'right'},
  }],
  imports: [
    ...modules,
  ],
  exports: [...components, ...directives, ...pipes, ...modules, PageTitleComponent, SetInputRelativeAmountComponent, SmallNumberPipe, ExceededBalanceMsgComponent],
})
export class SharedModule {
}
