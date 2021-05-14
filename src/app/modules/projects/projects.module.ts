import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsRoutingModule } from './projects-routing.module';
import { ProjectsListPage } from './pages/projects-list/projects-list.page';
import { ProjectPage } from './pages/project/project.page';
import { ProjectsService } from './projects.service';
import { SharedModule } from '../../shared/shared.module';
import { ProjectsHeaderComponent } from './components/projects-header/projects-header.component';
import { SingleProjectComponent } from './components/single-project/single-project.component';

const components = [
  ProjectsListPage,
  ProjectPage,
  ProjectsHeaderComponent,
  SingleProjectComponent,
];

@NgModule({
  declarations: [...components],
  providers: [ProjectsService],
  imports: [CommonModule, ProjectsRoutingModule, SharedModule],
})
export class ProjectsModule {}
