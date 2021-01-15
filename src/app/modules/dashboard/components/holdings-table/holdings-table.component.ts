import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-holdings-table',
  templateUrl: './holdings-table.component.html',
  styleUrls: ['./holdings-table.component.scss']
})
export class HoldingsTableComponent implements OnInit {
  @Input() portfolio;
  constructor() { }

  ngOnInit(): void {
  }

}
