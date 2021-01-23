import {Injectable} from '@angular/core';
import {HistoricRoiChartOptions, PoolsChartOptions} from '../models/types';
import * as HighCharts from 'highcharts';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  constructor() {
  }

  private static get pieChartColors(): any {
    const colors = [];
    const arr = ['#6610f2', '#78ffd6', '#39393a', '#e6e6e6', '#06d6a0', '#f42272', '#b892ff', '#d81e5b', '#533a7b', '#98c1d9'];
    for (let i = 0; i < 10; i++) {
      colors.push(i % 10 == 0 ? arr[i] : HighCharts.color(arr[i]).brighten((i - 3) / 7).get());
    }
    return colors;
  }

  composePieChart(data): any {
    return {
      chart: {
        plotBackgroundColor: '#ffffff',
        borderColor: '#ffffff',
        marginBottom: 30,
        plotShadow: false,
        type: 'pie',

      },
      title: {
        text: ''
      },
      credits: {
        enabled: false,
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      accessibility: {
        point: {
          valueSuffix: '%'
        }
      },
      plotOptions: {
        pie: {
          size: '100%',
          innerSize: '45%',
          allowPointSelect: true,
          borderWidth: 0,
          cursor: 'pointer',
          colors: ChartsService.pieChartColors,
          showInLegend: true,
          dataLabels: {
            style: {fontFamily: 'Roboto, "Helvetica Neue", sans-serif', fontSize: '8px'},
            color: '#eeeeee',
            borderWidth: 0,
            connectorColor: '#a7a7a7',
            border: 0,
            connectorWidth: 2,
            crop: false,
            enabled: false,
            distance: '-30%',
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          }
        }
      },
      legend: {
        enabled: true,
        floating: true,
        verticalAlign: 'bottom',
        y: 15,
        itemStyle: {fontFamily: 'Roboto, "Helvetica Neue", sans-serif', fontSize: '10px'},
        labelFormatter: function () {
          return this.name + ': ' + this.percentage.toFixed(1) + '%';
        }
      },
      series: [{
        name: 'Distribution',
        colorByPoint: true,
        data,
      }]
    };
  }

  composeHighChart(data: any, isReef = false): any {
    return {
      chart: {
        zoomType: 'x'
      },
      title: {
        text: ''
      },
      subtitle: {
        text: ''
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: isReef ? 'Price in USD' : 'ROI'
        }
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        area: {
          fillOpacity: 0.3,
          fillColor: '#e6e6e6',
          color: '#6610f2',
          opacity: 0.7,
          marker: {
            radius: 2
          },
          lineWidth: 4,
          threshold: null
        }
      },

      series: [{
        type: 'area',
        name: isReef ? 'Price in USD' : 'ROI',
        data,
      }]
    };
  }

  composeHistoricRoiChart(labels: any[], data: any[]): Partial<HistoricRoiChartOptions> {
    return {
      series: [
        {
          name: 'Return of Investment',
          data: [...data]
        },
      ],
      chart: {
        height: 350,
        type: 'area',
        toolbar: {
          show: false,
        },
      },
      fill: {
        opacity: 0.5,
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 90, 100]
        }
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
        type: 'datetime',
        labels: {
          offsetY: 1,
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
          data: [...data]
        },
        {
          data: data.map(d => 100 - d),
        }
      ],
      colors: ['#DE5DA6', '#fff'],
      chart: {
        height: 350,
        type: 'bar',
        toolbar: {
          show: false,
        },
        stacked: true,
        stackType: '100%',
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
        enabledOnSeries: [0],
        formatter(val: number): string {
          return val.toFixed(0) + '%';
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
            cssClass: 'text-break'
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
              colorFrom: '#fff',
              colorTo: '#fff',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5
            }
          }
        },
        tooltip: {
          enabled: false,
          offsetY: -35
        }
      },
      tooltip: {
        enabled: false,
      },
      legend: {
        show: false,
      },
      fill: {
        // colors: ['#DE5DA6'],
        // type: '',
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
        max: 100,
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
