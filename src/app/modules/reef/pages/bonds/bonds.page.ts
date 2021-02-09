import {ChangeDetectionStrategy, Component} from '@angular/core';
import {BondsService} from '../../../../core/services/bonds.service';
import {UiUtils} from '../../../../shared/utils/ui.utils';

@Component({
  selector: 'app-bonds',
  templateUrl: './bonds.page.html',
  styleUrls: ['./bonds.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BondsPage {
  UiUtils = UiUtils;

  constructor(public bondsService: BondsService) {
  }
}
