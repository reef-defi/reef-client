import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

const components = [FooterComponent, HeaderComponent];
const directives = [];

@NgModule({
  declarations: [...components, ...directives, SidebarComponent],
  imports: [
    CommonModule
  ],
  exports: [...components, ...directives],
})
export class SharedModule { }
