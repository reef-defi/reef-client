import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IChainData } from '../../../core/models/types';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  readonly currentYear = new Date().getFullYear();
  @Input() chainInfo: IChainData | undefined;
  @Input() version: string | undefined;
  @Input() currentAddress: string | undefined;
  @Output() signOut = new EventEmitter();

  onSignOut(): void {
    this.signOut.emit();
  }
}
