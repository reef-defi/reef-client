import { Injectable } from '@angular/core';
import { ApexChartOptions } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  private chartOptions: Partial<ApexChartOptions>;
  constructor() { }

  composeWeightAllocChart(labels: any, data: any[]): Partial<ApexChartOptions> {
    return  {
      series: [
        {
          name: 'Allocation',
          data: [...data]
        }
      ],
      chart: {
        height: 350,
        type: 'bar'
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
