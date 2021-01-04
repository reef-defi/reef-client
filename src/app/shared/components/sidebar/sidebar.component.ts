import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { IChainData } from '../../../core/models/types';
import { MatDialog } from '@angular/material/dialog';
import { UniswapService } from '../../../core/services/uniswap.service';
import {ConnectorService} from "../../../core/services/connector.service";

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
  readonly pendingTx$ = this.connectorService.pendingTransaction$;

  constructor(private dialog: MatDialog, private readonly uniswapService: UniswapService,
              private readonly connectorService: ConnectorService) {}

  onSignOut(): void {
    this.signOut.emit();
  }

}
