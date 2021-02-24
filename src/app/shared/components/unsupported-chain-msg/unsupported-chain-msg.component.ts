import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ChainId, TransactionType } from '../../../core/models/types';
import { getChainData } from '../../../core/utils/chains';
import { TransactionsService } from '../../../core/services/transactions.service';

@Component({
  selector: 'app-unsupported-chain-msg',
  templateUrl: './unsupported-chain-msg.component.html',
  styleUrls: ['./unsupported-chain-msg.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnsupportedChainMsgComponent {
  @Input() transactionType: TransactionType | undefined;
  @Input() chainId: ChainId | undefined;
  @Input() displayUnsupportedChainIdMessage: boolean;
  TransactionsService = TransactionsService;
  ChainId = ChainId;

  public getChainName(chainId: number): string {
    return getChainData(chainId).name;
  }
}
