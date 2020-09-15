import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';

const components = [FooterComponent, HeaderComponent, SidebarComponent];
const directives = [];

@NgModule({
  declarations: [...components, ...directives],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [...components, ...directives, RouterModule],
})
export class SharedModule { }
