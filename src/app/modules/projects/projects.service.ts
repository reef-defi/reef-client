import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { EMPTY, Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { IProjectsResponse } from '../../core/models/types';

@Injectable()
export class ProjectsService {
  private readonly apiUrl = environment.reefNodeApiUrl;

  constructor(private readonly http: HttpClient) {}

  getAllProjects(): Observable<IProjectsResponse> {
    return this.http.get<IProjectsResponse>(`${this.apiUrl}/projects`).pipe(
      catchError((e: HttpErrorResponse) => {
        console.log(e);
        return EMPTY;
      })
    );
  }
}
