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

export interface Vault {
  [key: string]: string;
}

export interface VaultAPY {
  [key: string]: {
    APY: number;
  };
}

export interface IVault {
  [key: string]: {
    APY: number;
    address: string;
    percentage?: number;
  };
}


export interface IContract {
  defaultAccount: string;
  defaultBlock: number | string;
  defaultHardFork: string;
  defaultChain: string;
  defaultCommon: {
    customChain: any;
    baseChain: string;
    hardfork?: string;
  };
  transactionBlockTimeout: number;
  transactionConfirmationBlocks: number;
  transactionPollingTimeout: number;
  handleRevert: boolean;
  options: IContractOptions;
  clone: () => IContract;
  deploy: (opts: IContractOptions) => any;
  methods: {
    [key: string]: ContractMethod;
  };
  once: (event: string, options?: any, cb?: () => any) => undefined;
  events: any;
  getPastEvents: (event: string, options?: any, cb?: () => any) => Promise<any[]>;
}

type ContractMethod = (...params: any) => {
  arguments: [];
  call: <T>(
    options?: { from?: string, gasPrice?: string, gas?: number },
    defaultBlock?: number | string,
    callback?: () => any,
  ) => Promise<T>;
  send: <T>(
    options?: { from?: string, value?: string | number, gasPrice?: string, gas?: number },
    callback?: () => any,
  ) => Promise<{ transactionHash: string; receipt: any; confirmation: number; error?: any }>;
  estimateGas: (options?: { from?: string, gas?: number, value?: number | string }) => Promise<number>;
  encodeAbi: () => string;
};

interface IContractOptions {
  address: string;
  jsonInterface: [];
  data: string;
  from: string;
  gasPrice: string;
  gas: number;
  handleRevert: boolean;
  transactionBlockTimeout: number;
  transactionConfirmationBlocks: number;
  transactionPollingTimeout: number;
  chain: number;
  hardfork: number;
  common: number;
}

export interface ITransaction {
  hash: string;
  nonce: number;
  blockHash: string | null;
  blockNumber: number | null;
  transactionIndex: number | null;
  from: string;
  to: string | null;
  value: string;
  gasPrice: string;
  gas: number;
  input: string;
  timestamp: Date;
  action?: string;
}

export interface IProviderUserInfo {
  address: string;
  balance: string;
  chainInfo: IChainData;
  reefBalance: string;
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
