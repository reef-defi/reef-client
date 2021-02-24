import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BondsService } from '../../../../core/services/bonds.service';
import { UiUtils } from '../../../../shared/utils/ui.utils';
import { BondSaleStatus, TransactionType } from '../../../../core/models/types';
import { ConnectorService } from '../../../../core/services/connector.service';

@Component({
  selector: 'app-bonds',
  templateUrl: './bonds.page.html',
  styleUrls: ['./bonds.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BondsPage {
  UiUtils = UiUtils;
  BondSaleStatus = BondSaleStatus;
  TransactionType = TransactionType;

  constructor(
    public bondsService: BondsService,
    public readonly connectorService: ConnectorService
  ) {}
}
