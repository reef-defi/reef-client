import { Component, Input } from '@angular/core';
import { IVaultInfo } from '../../../../core/models/types';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-vaults-composition',
  templateUrl: './vaults-composition.component.html',
  styleUrls: ['./vaults-composition.component.scss']
})
export class VaultsCompositionComponent {
  private mColors: ThemePalette[] = [
    'primary',
    'accent',
    'warn'];
  @Input() vaults: IVaultInfo | undefined;
  @Input() isList: boolean | undefined;

  get colors(): ThemePalette[] {
    return [...this.mColors, ...this.mColors, ...this.mColors];
  }
}
