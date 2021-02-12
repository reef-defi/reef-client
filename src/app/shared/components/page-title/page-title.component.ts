import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ChainId, TransactionType } from '../../../core/models/types';
import { TransactionsService } from '../../../core/services/transactions.service';
import { getChainData } from '../../../core/utils/chains';

@Component({
  selector: 'app-page-title',
  templateUrl: './page-title.component.html',
  styleUrls: ['./page-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTitleComponent {
  @Input() transactionType: TransactionType | undefined;
  @Input() chainId: ChainId | undefined;
  @Input() title: string | undefined;
  @Input() subtitle: string | undefined;

  public isTransactionSupported(): boolean {
    return TransactionsService.checkIfTransactionSupported(
      this.transactionType,
      this.chainId
    );
  }

  public getChainName(chainId: number) {
    return getChainData(chainId).name;
  }
}
