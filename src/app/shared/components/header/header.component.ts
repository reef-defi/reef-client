import { Component, Input, OnInit } from '@angular/core';
import { IProviderUserInfo } from '../../../core/models/types';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() providerName: string | undefined;
  @Input() providerUserInfo: IProviderUserInfo | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
