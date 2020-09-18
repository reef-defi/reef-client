import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { FilterPipe } from './pipes/filter.pipe';

const components = [FooterComponent, HeaderComponent, SidebarComponent];
const directives = [];
const pipes = [FilterPipe];

@NgModule({
  declarations: [...components, ...directives, ...pipes],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [...components, ...directives, ...pipes, RouterModule],
})
export class SharedModule { }
