import {Component} from '@angular/core';
import {BondsService} from '../../../../core/services/bonds.service';

@Component({
  selector: 'app-bonds',
  templateUrl: './bonds.page.html',
  styleUrls: ['./bonds.page.scss'],
})
export class BondsPage {
  constructor(public bondsService: BondsService) {
  }
}
