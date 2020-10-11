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
        type: 'area',
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false,
        },
      },
      fill: {
        opacity: 0.5,
        type: 'solid',
        colors: ['#DE5DA6']
      },
      colors: ['#DE5DA6'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      grid: {
        show: false,
      },
      xaxis: {
        categories: [...labels],
        labels: {
          offsetY: 10,
          trim: true,
          style: {
            colors: 'white',
            fontFamily: 'inherit',
            fontSize: '13px',
            cssClass: 'chart-label'
          },
          show: true,
        },
        axisTicks: {
          show: false
        },
      },
      yaxis: {
        show: true,
        labels: {
          show: true,
          style: {
            colors: '#FFF',
            fontFamily: 'inherit',
            fontSize: '14px',
            cssClass: 'chart-label'
          },
        }
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
      grid: {
        show: false,
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: 'bottom'
          }
        }
      },
      dataLabels: {
        enabled: true,

        formatter(val: number): string {
          return val.toFixed(2) + '%';
        },
        style: {
          fontFamily: 'inherit',
          fontSize: '13px',
          fontWeight: 400,
          colors: ['#DADADA']
        }
      },
      xaxis: {
        categories: [...labels],
        // offsetY: 100,
        position: 'top',
        labels: {
          style: {
            colors: 'white',
            fontFamily: 'inherit',
            fontSize: '14px',
            cssClass: 'chart-label'
          },
          show: true,
        },
        axisBorder: {
          show: false,
          color: 'yellow',
          strokeWidth: 5,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: false,
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
        colors: ['#DE5DA6'],
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
        text: '',
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
