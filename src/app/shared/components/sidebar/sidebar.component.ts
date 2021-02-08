import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { IChainData, PendingTransaction } from '../../../core/models/types';
import { MatDialog } from '@angular/material/dialog';
import { UniswapService } from '../../../core/services/uniswap.service';
import { ConnectorService } from '../../../core/services/connector.service';
import { TransactionsService } from '../../../core/services/transactions.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @ViewChild('pendingTxDialog') pendingTxDialog: TemplateRef<any>;
  readonly currentYear = new Date().getFullYear();
  @Input() chainInfo: IChainData | undefined;
  @Input() version: string | undefined;
  @Input() currentAddress: string | undefined;
  @Output() signOut = new EventEmitter();
  readonly pendingTxs$ = this.transactionService.pendingTransactions$;
  mobileNavShown: boolean;

  constructor(
    private dialog: MatDialog,
    private readonly uniswapService: UniswapService,
    private readonly transactionService: TransactionsService
  ) {}

  openPendingTx(tx: PendingTransaction[]) {
    this.dialog.open(this.pendingTxDialog, { data: tx });
  }

  onSignOut(): void {
    this.signOut.emit();
  }
}
