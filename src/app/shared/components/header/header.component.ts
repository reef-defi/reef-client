import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { EthPrice, IProviderUserInfo } from '../../../core/models/types';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public isMobileLayout: boolean;
  @HostListener('window:resize', [])
  onResize(): void {
    this.isMobileLayout = window.innerWidth < 992;
  }
  @Input() version: string | undefined;
  @Input() providerName: string | undefined;
  @Input() providerUserInfo: IProviderUserInfo | undefined;
  @Input() ethPrice: EthPrice | undefined;
  @Output() signOut = new EventEmitter();

  constructor() {}

  ngOnInit(): void {
    this.isMobileLayout = window.innerWidth < 992;
  }

  onSignOut(): void {
    this.signOut.emit();
  }
}
