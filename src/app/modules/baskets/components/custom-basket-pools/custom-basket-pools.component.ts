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
  dataSource;
  Object = Object;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  @Input() set pools(val: IPoolsMetadata[] | undefined) {
    if (val) {
      const pools = val.filter((pool: IPoolsMetadata) => pool.ExchangeName.toLocaleLowerCase() !== 'curve');
      this.dataSource = new MatTableDataSource(pools);
    }
  }

  @Input() chartPoolData: any;
  @Input() canAddPools: boolean | undefined;
  @Input() disabledSlider: boolean | undefined;
  @Output() addPool = new EventEmitter();
  @Output() removePool = new EventEmitter();
  @Output() changeAllocation = new EventEmitter();

  public displayedColumns: string[] = ['Exchange', 'Pool Name', 'Add'];

  constructor() {
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onAddPool(symbol: string): void {
    this.addPool.emit(symbol);
  }

  onAllocChange(symbol: string, event: any): void {
    this.changeAllocation.emit([symbol, event]);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

}
