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
  ApexStroke, ApexResponsive, ApexLegend,
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
  tokenPools: string[];
  tokenWeights: number[];
  balancerPools: string[];
  balancerWeights: number[];
  mooniswapPools: string[];
  mooniswapWeights: number[];
}

export interface IBasket {
  name: string;
  investedETH: string[];
  index: number;
  BalancerPools: {
    pools: any,
    weights: any;
  };
  UniswapPools: {
    pools: any,
    weights: any;
  };
  Tokens: {
    pools: any,
    weights: any;
  };
  MooniswapPools: {
    pools: any,
    weights: any;
  };
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
  legend: ApexLegend;
  tooltip: any;
  colors: any[];
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  title: ApexTitleSubtitle;
  grid: ApexGrid;
  responsive: ApexResponsive;
};

export type HistoricRoiChartOptions = {
  colors: any[];
  fill: ApexFill;
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
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
