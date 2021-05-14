import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectsListPage } from './pages/projects-list/projects-list.page';
import { ProjectPage } from './pages/project/project.page';

const routes: Routes = [
  {
    path: '',
    component: ProjectsListPage,
  },
  {
    path: 'project/:id',
    component: ProjectPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectsRoutingModule {}
