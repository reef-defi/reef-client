import { Component, Input, Output } from '@angular/core';
import { Project } from '../../../../core/models/types';

@Component({
  selector: 'app-single-project',
  templateUrl: './single-project.component.html',
  styleUrls: ['./single-project.component.scss'],
})
export class SingleProjectComponent {
  @Input() project: Project | undefined;
  @Input() isFeatured: boolean | undefined;
}
