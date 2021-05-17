import { Component } from '@angular/core';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { map, pluck, shareReplay } from 'rxjs/operators';
import { Project } from '../../../../core/models/types';
import { startWith } from 'rxjs/internal/operators/startWith';
import { ProjectsService } from '../../projects.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
})
export class ProjectPage {
  project$ = combineLatest([
    this.projectsService.getAllProjects(),
    this.route.params.pipe(pluck('id')),
  ]).pipe(
    map(([projects, id]: [{ featured: Project; items: Project[] }, string]) => {
      if (projects.featured.id === id) {
        return projects.featured;
      }
      return projects.items.find((p: Project) => p.id === id);
    }),
    startWith({}),
    shareReplay(1)
  );

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly route: ActivatedRoute
  ) {}
}
