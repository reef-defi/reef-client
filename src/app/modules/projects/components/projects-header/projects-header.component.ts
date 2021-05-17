import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-projects-header',
  templateUrl: './projects-header.component.html',
  styleUrls: ['./projects-header.component.scss'],
})
export class ProjectsHeaderComponent {
  @Input() categories: string[] | undefined;
  @Output() filter = new EventEmitter<string>();

  onFilter(filterBy: string) {
    console.log(filterBy);
    this.filter.emit(filterBy);
  }
}
