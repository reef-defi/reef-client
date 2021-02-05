import { Component, Input, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent implements OnInit {
  @Input() color: ThemePalette = 'primary';
  @Input() diameter = 50;
  @Input() isWholePage = false;
  constructor() {}

  ngOnInit(): void {}
}
