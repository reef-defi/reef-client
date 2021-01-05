import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {IChainData} from '../../../core/models/types';
import {MatDialog} from '@angular/material/dialog';
import {UniswapService} from '../../../core/services/uniswap.service';
import {ConnectorService} from "../../../core/services/connector.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  readonly currentYear = new Date().getFullYear();
  @Input() chainInfo: IChainData | undefined;
  @Input() version: string | undefined;
  @Input() currentAddress: string | undefined;
  @Output() signOut = new EventEmitter();

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }

  readonly pendingTx$ = this.connectorService.pendingTransaction$;
  sidebarOpen: boolean;
  innerWidth: number;
  manualToggle: boolean;
  minWidth = 992;

  constructor(private dialog: MatDialog, private readonly uniswapService: UniswapService,
              private readonly connectorService: ConnectorService) {
  }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
  }

  onSignOut(): void {
    this.signOut.emit();
  }

}
