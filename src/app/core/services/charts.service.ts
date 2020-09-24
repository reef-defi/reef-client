import { Injectable } from '@angular/core';
import { HistoricRoiChartOptions, PoolsChartOptions } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  constructor() {
  }

  composeHistoricRoiChart(labels: any[], data: any[]): Partial<HistoricRoiChartOptions> {
    return {
      series: [
        {
          name: 'Return of Investment',
          data: [...data]
        }
      ],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false,
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: 'Historic ROI',
        align: 'left'
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      xaxis: {
        categories: [...labels]
      },
    };
  }

  composeWeightAllocChart(labels: any, data: any[]): Partial<PoolsChartOptions> {
    return {
      series: [
        {
          name: 'Allocation',
          data: [...data]
        }
      ],
      chart: {
        height: 350,
        type: 'bar',
        toolbar: {
          show: false,
        }
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter(val): string {
          return val + '%';
        },
        offsetY: -20,
        style: {
          fontSize: '11px',
          colors: ['#304758']
        }
      },
      xaxis: {
        categories: [...labels],
        position: 'top',
        labels: {
          offsetY: -18
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        crosshairs: {
          fill: {
            type: 'gradient',
            gradient: {
              colorFrom: '#D8E3F0',
              colorTo: '#BED1E6',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5
            }
          }
        },
        tooltip: {
          enabled: true,
          offsetY: -35
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
        }
      },
      yaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          show: false,
          formatter(val): string {
            return val + '%';
          }
        }
      },
      title: {
        text: 'Weight Allocations for each pool',
        floating: false,
        offsetY: 320,
        align: 'center',
        style: {
          color: '#444'
        }
      }
    };
  }
}
