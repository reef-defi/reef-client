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
  ApexGrid,
  ApexStroke,
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
  Assets: IPoolMetadataAsset[];
  ExchangeAddress: string;
  ExchangeName: string;
  Id: number;
  LPToken: string;
  LiquidityUSD: number;
  ROI30d: number;
  Symbol: string;
  VolumeUSD: number;
}

export interface IPoolMetadataAsset {
  address: string;
  balance: number;
  name: string;
  symbol: string;
  weight: number;
}

export interface IBasketPoolsAndCoinInfo {
  uniswapPools: string[][];
  uniSwapWeights: number[];
  tokenPools: string[][];
  tokenWeights: number[];
  balancerPools: string[][];
  balancerWeights: number[];
}

export interface IGenerateBasketRequest {
  amount: string;
  risk_aversion: number;
}

export interface IGenerateBasketResponse {
  [key: string]: number;
}

export interface IBasketHistoricRoi {
  [key: string]: {
    [key: string]: number,
    weighted_roi: number,
  };
}

export type PoolsChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  title: ApexTitleSubtitle;
};

export type HistoricRoiChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

export interface EthPrice {
  ethereum: {
    usd: number
  };
}
