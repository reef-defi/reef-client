import { Component, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ChainId } from '../../../../../core/models/types';

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
  @Output()
  refresh = new EventEmitter<void>();
}
