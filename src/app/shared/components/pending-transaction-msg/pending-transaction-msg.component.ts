import { Component, Input } from '@angular/core';
import {
  PendingTransaction,
  TransactionType,
} from '../../../core/models/types';

@Component({
  selector: 'app-pending-transaction-msg',
  templateUrl: './pending-transaction-msg.component.html',
  styleUrls: ['./pending-transaction-msg.component.scss'],
})
export class PendingTransactionMsgComponent {
  TransactionType = TransactionType;
  @Input() transaction: PendingTransaction | undefined;
}
