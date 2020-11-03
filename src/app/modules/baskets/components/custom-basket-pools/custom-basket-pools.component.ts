import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IPoolsMetadata } from '../../../../core/models/types';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-custom-basket-pools',
  templateUrl: './custom-basket-pools.component.html',
  styleUrls: ['./custom-basket-pools.component.scss']
})
export class CustomBasketPoolsComponent implements AfterViewInit {
  poolsDataSource;
  Object = Object;
  @ViewChild('poolPaginator') poolPaginator: MatPaginator;

  @Input() set poolsAndTokens(val: IPoolsMetadata[] | undefined) {
    if (val) {
      const pools = val.filter((pool: IPoolsMetadata) => pool.ExchangeName.toLocaleLowerCase() !== 'curve');
      this.poolsDataSource = new MatTableDataSource(pools);
    }
  }

  @Input() chartPoolData: any;
  @Input() canAddPools: boolean | undefined;
  @Input() disabledSlider: boolean | undefined;
  @Output() addPool = new EventEmitter();
  @Output() removePool = new EventEmitter();
  @Output() changeAllocation = new EventEmitter();

  public displayedPoolsColumns: string[] = ['Type', 'Name', 'Exchange', 'Add'];

  constructor() {
  }

  search(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.poolsDataSource.filter = filterValue.trim().toLowerCase();
  }

  filterBy(event: MatRadioChange): void {
    if (event.value) {
      this.poolsDataSource.filter = event.value;
    } else {
      this.poolsDataSource.filter = '';
    }
  }

  onAddPool(symbol: string): void {
    this.addPool.emit(symbol);
  }

  onAllocChange(symbol: string, event: any): void {
    this.changeAllocation.emit([symbol, event]);
  }

  ngAfterViewInit(): void {
    this.poolsDataSource.paginator = this.poolPaginator;
  }

}
