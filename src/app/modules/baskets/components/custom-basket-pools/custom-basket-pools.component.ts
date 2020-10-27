import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IPoolsMetadata } from '../../../../core/models/types';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-custom-basket-pools',
  templateUrl: './custom-basket-pools.component.html',
  styleUrls: ['./custom-basket-pools.component.scss']
})
export class CustomBasketPoolsComponent implements AfterViewInit {
  poolsDataSource;
  tokensDataSource;
  Object = Object;
  @ViewChild('poolPaginator') poolPaginator: MatPaginator;
  @ViewChild('tokenPaginator') tokenPaginator: MatPaginator;
  @Input() set pools(val: IPoolsMetadata[] | undefined) {
    if (val) {
      const pools = val.filter((pool: IPoolsMetadata) => pool.ExchangeName.toLocaleLowerCase() !== 'curve');
      this.poolsDataSource = new MatTableDataSource(pools);
    }
  }

  @Input() set tokens(val: any | undefined) {
    if (val) {
      const tokens = Object.keys(val).map((key: string) => ({ address: val[key], name: key}));
      this.tokensDataSource = new MatTableDataSource(tokens);
    }
  }
  @Input() chartPoolData: any;
  @Input() canAddPools: boolean | undefined;
  @Input() disabledSlider: boolean | undefined;
  @Output() addPool = new EventEmitter();
  @Output() removePool = new EventEmitter();
  @Output() changeAllocation = new EventEmitter();

  public displayedPoolsColumns: string[] = ['Exchange', 'Pool Name', 'Add'];
  public displayedTokensColumns: string[] = ['Token', 'Add'];

  constructor() {
  }

  applyFilter(event: Event, source: string): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this[source].filter = filterValue.trim().toLowerCase();
  }

  onAddPool(symbol: string): void {
    this.addPool.emit(symbol);
  }

  onAllocChange(symbol: string, event: any): void {
    this.changeAllocation.emit([symbol, event]);
  }

  ngAfterViewInit(): void {
    this.poolsDataSource.paginator = this.poolPaginator;
    this.tokensDataSource.paginator = this.tokenPaginator;
  }

}
