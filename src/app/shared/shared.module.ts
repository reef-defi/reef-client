import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

const components = [FooterComponent, HeaderComponent, SidebarComponent];
const directives = [];

@NgModule({
  declarations: [...components, ...directives],
  imports: [
    CommonModule
  ],
  exports: [...components, ...directives],
})
export class SharedModule { }
