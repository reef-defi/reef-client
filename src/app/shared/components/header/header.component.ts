import { Component, Input, OnInit } from '@angular/core';
import { EthPrice, IProviderUserInfo } from '../../../core/models/types';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() version: string | undefined;
  @Input() providerName: string | undefined;
  @Input() providerUserInfo: IProviderUserInfo | undefined;
  @Input() ethPrice: EthPrice | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
