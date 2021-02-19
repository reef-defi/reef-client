import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-portfolio-positions',
  templateUrl: './portfolio-positions.component.html',
  styleUrls: ['./portfolio-positions.component.scss'],
})
export class PortfolioPositionsComponent {
  @Input()
  positions: any;
  @Input()
  title: string;
}
