import { Component, Input, OnInit } from '@angular/core';

type LoaderType = 'composition' | 'vault' | 'transaction' | 'chart' | 'basket' | 'circle';

@Component({
  selector: 'app-skeleton-loading',
  templateUrl: './skeleton-loading.component.html',
  styleUrls: ['./skeleton-loading.component.scss']
})
export class SkeletonLoadingComponent implements OnInit {
  @Input() type: LoaderType;
  @Input() count = 1;
  @Input() animation = 'progress';
  @Input() appearance = '';
  public styles: { [key: string]: { [key: string]: string } } = {
    composition: {
      height: '30px',
    },
    vault: {
      height: '30px',
      'background-color': 'rgb(124, 181, 236, 0.2)',
    },
    chart: {
      'margin-top': '0',
      'border-top': '1px white',
      height: '50px',
      'background-color': 'rgb(124, 181, 236, 0.2)',
    },
    transactions: {
      height: '15px',
      'background-color': 'rgb(132, 132, 132, 0.1)',
    },
    basket: {
      height: '300px',
    },
    circle: {
      height: '65px',
      width: '65px',
    }
  };

  constructor() {
  }

  ngOnInit(): void {
  }


}
