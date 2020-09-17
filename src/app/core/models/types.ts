import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexFill,
} from 'ng-apexcharts';

export interface IProviderUserInfo {
  address: string;
  balance: string;
  chainInfo: IChainData;
}

export interface IChainData {
  name: string;
  short_name: string;
  chain: string;
  network: string;
  chain_id: number;
  network_id: number;
  rpc_url: string;
  native_currency: IAssetData;
}

export interface IAssetData {
  symbol: string;
  name: string;
  decimals: string;
  contractAddress: string;
  balance?: string;
}

export interface IPoolsMetadata {
  assets: IPoolMetadataAsset[];
  exchange: string;
  ownershipToken: string;
  platform: string;
  poolName: string;
  roi: number;
  tags: any[];
  usdLiquidity: number;
  usdVolume: number;
}

export interface IPoolMetadataAsset {
  address: string;
  balance: number;
  name: string;
  symbol: string;
  weight: number;
}

export interface IGenerateBasketRequest {
  amount: string;
  risk_aversion: number;
}

export interface IGenerateBasketResponse {
  [key: string]: number;
}

export type ApexChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  title: ApexTitleSubtitle;
};
