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


const components = [FooterComponent, HeaderComponent, SidebarComponent, NotificationComponent];
const directives = [];
const pipes = [FilterPipe];
const modules = [MatSliderModule, MatSnackBarModule, MatButtonModule];

@NgModule({
  declarations: [...components, ...directives, ...pipes],
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
