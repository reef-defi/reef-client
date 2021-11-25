import { Component, OnInit } from '@angular/core';
import { ProjectsService } from '../../projects.service';
import { Observable } from 'rxjs';
import { IProjectsResponse } from '../../../../core/models/types';

@Component({
  selector: 'app-projects',
  templateUrl: './projects-list.page.html',
  styleUrls: ['./projects-list.page.scss'],
})
export class ProjectsListPage implements OnInit {
  public readonly projects$: Observable<IProjectsResponse> =
    this.projectsService.getAllProjects();
  public filterCriteria = '';

  constructor(private readonly projectsService: ProjectsService) {}

  ngOnInit(): void {}

  filterBy(filter: string) {
    this.filterCriteria = filter;
  }
}
