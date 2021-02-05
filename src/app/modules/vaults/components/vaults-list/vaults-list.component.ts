import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IVault } from '../../../../core/models/types';

@Component({
  selector: 'app-vaults-list',
  templateUrl: './vaults-list.component.html',
  styleUrls: ['./vaults-list.component.scss'],
})
export class VaultsListComponent {
  Object = Object;
  @Input() vaults: IVault | undefined;
  @Output() vaultAllocChanged = new EventEmitter();

  onVaultAllocChanged(percentage, name): void {
    this.vaultAllocChanged.emit([name, percentage]);
  }
}
