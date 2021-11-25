import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';
import { Observable, Subject } from 'rxjs';

export interface IProjectsResponse {
  categories: string[];
  featured: Project;
  items: Project[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  longDesc: string;
  logo: string;
  categories: string[];
  links: {
    facebook?: string;
    app?: string;
    email?: string;
    website?: string;
    twitter?: string;
    telegram?: string;
    github?: string;
    medium?: string;
  };
}

export type RpcErrorTypes = {
  [key in EErrorTypes]: string;
};

export interface IPortfolio {
  aavePositions?: any[] | ErrorDisplay;
  balancerPositions?: any[] | ErrorDisplay;
  compoundPositions?: any[] | ErrorDisplay;
  tokens?: any[] | ErrorDisplay;
  uniswapPositions?: any[] | ErrorDisplay;
  refreshSubject?: Subject<ExchangeId>;
}

export type SupportedPortfolio = Pick<
  IPortfolio,
  'tokens' | 'uniswapPositions' | 'compoundPositions'
>;

export interface ICreateBasketEntry {
  address: string;
  timeStamp: number;
  amount: number;
  basketIdx: number;
}

export enum EErrorTypes {
  USER_CANCELLED = 4001,
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  BASKET_POSITION_INVEST_ERROR = 845737,
}

export enum TransactionType {
  BUY_REEF = 'BUY_REEF',
  LIQUIDITY_ETH = 'LIQUIDITY_ETH',
  LIQUIDITY_USDT = 'LIQUIDITY_USDT',
  REEF_FARM = 'REEF_FARM',
  REEF_USDT_FARM = 'REEF_USDT_FARM',
  REEF_ETH_FARM = 'REEF_ETH_FARM',
  APPROVE_TOKEN = 'APPROVE_TOKEN',
  REEF_BOND = 'REEF_BOND',
  REEF_BASKET = 'REEF_BASKET',
}

export interface PendingTransaction {
  hash: string;
  type: TransactionType;
  tokens: TokenSymbol[];
  txUrl: string;
  scanner: string;
  chainId: ChainId;
}

export interface QuoteResponse {
  quotationExpiredTime: string;
  quotationTime: string;
  quoteId: string;
  quotePrice: number;
  status: string;
  totalAmount: number;
  totalPrice: number;
}

export interface QuotePayload {
  cryptoCurrency: string;
  baseCurrency: string;
  requestedAmount?: number;
  address: string;
  email: string;
}

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

export enum TokenSymbol {
  ETH = 'ETH',
  WETH = 'WETH',
  BNB = 'BNB',
  WBNB = 'WBNB',
  USDT = 'USDT',
  REEF = 'REEF',
  REEF_WETH_POOL = 'REEF_WETH_POOL',
  REEF_USDT_POOL = 'REEF_USDT_POOL',
}

export interface IReefPricePerToken {
  tokenSymbol: TokenSymbol;
  REEF_PER_TOKEN: string;
  TOKEN_PER_REEF: string;
  totalReefReserve: string;
  amountRequested?: number;
  amountOutMin?: number;
}

/* using Contract directly
export interface IContract {
  defaultAccount: string;
  defaultBlock: number | string;
  defaultHardFork?: string;
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
}*/

type ContractMethod = (...params: any) => {
  arguments: [];
  call: <T>(
    options?: { from?: string; gasPrice?: string; gas?: number },
    defaultBlock?: number | string,
    callback?: () => any
  ) => Promise<T>;
  send: <T>(
    options?: {
      from?: string;
      value?: string | number;
      gasPrice?: string;
      gas?: number;
      amount?: string;
    },
    callback?: () => any
  ) =>
    | Promise<{
        transactionHash: string;
        receipt: any;
        confirmation: number;
        error?: any;
      }>
    | any;
  estimateGas: (options?: {
    from?: string;
    gas?: number;
    value?: number | string;
  }) => Promise<number>;
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
  chainInfo: IChainData;
  provider: any;
  availableSmartContractAddresses: ProtocolAddresses;
}

export interface IChainData {
  name: string;
  short_name: string;
  chain: string;
  network: string;
  chain_id: ChainId;
  network_id: number;
  rpc_url: string;
  native_currency: IAssetData;
  chain_scanner_base_url?: string;
  chain_scanner_name?: string;
}

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  MATIC = 137,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  LOCAL_FORK = 1337,
  BINANCE_SMART_CHAIN = 56,
}

export enum ExchangeId {
  TOKENS = 'tokens',
  UNISWAP_V2 = 'uniswap_v2',
  BALANCER = 'balancer',
  COMPOUND = 'compound',
  AAVE = 'aave',
}

export enum ProviderName {
  INFURA = 'infura',
  ALCHEMY = 'alchemy',
  LOCAL_FORK = 'localhost',
}

export interface ProtocolAddresses {
  REEF_BASKET: string;
  REEF_VAULT_BASKET: string;
  REEF_FARMING: string;
  REEF_STAKING: string;
  ETH?: string;
  UNISWAP_ROUTER_V2: string;
  REEF_WETH_POOL: string;
  REEF_USDT_POOL: string;
  // REEF token address
  REEF: string;
  USDT: string;
  WETH: string;
  BNB: string;
  REEF_ESTIMATE_GAS?: string;
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

export interface IVaultBasket {
  name: string;
  investedETH: string;
  index: number;
  referrer: string;
  vaults: IVaultInfo;
  vaultsBalance: string[];
  isVault: boolean;
}

export interface IVaultInfo {
  vaults: {
    name: string;
    address: string;
  }[];
  weights: string[];
  types: string[];
}

export interface IBasket {
  name: string;
  investedETH: string;
  index: number;
  BalancerPools: {
    pools: any;
    weights: any;
  };
  UniswapPools: {
    pools: any;
    weights: any;
  };
  Tokens: {
    pools: any;
    weights: any;
  };
  MooniswapPools: {
    pools: any;
    weights: any;
  };
  referrer: string;
  isVault: boolean;
  timeStamp: number;
}

export interface IGenerateBasketRequest {
  amount: string;
  risk_level: number;
}

export interface IGenerateBasketResponse {
  [key: string]: number;
}

export interface IBasketHistoricRoi {
  [key: string]: {
    [key: string]: number;
    weighted_roi: number;
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
    usd: number;
  };
}

export interface TokenBalance {
  tokens: Token[];
  totalBalance: number;
  address: string;
}

export interface Token {
  contract_address?: string;
  contract_decimals?: number;
  contract_name?: string;
  quote?: number;
  quote_rate?: number;
  contract_ticker_symbol: string;
  balance: number;
  address: string;
  logo_url?: string;
}

/*export enum TokenSymbol {
  ETH = 'ETH',
  WETH = 'WETH',
  USDT = 'USDT',
  REEF = 'REEF',
  REEF_WETH_POOL = 'REEF_WETH_POOL',
  REEF_USDT_POOL = 'REEF_USDT_POOL',
  TESTR = 'TESTR'
}*/

export interface IPendingTransactions {
  transactions: PendingTransaction[];
}

export function getEnumKeyByEnumValue(
  myEnum: any,
  enumValue: number | string
): string {
  const keys = Object.keys(myEnum).filter((x) => myEnum[x] === enumValue);
  return keys.length > 0 ? keys[0] : '';
}

export interface Bond {
  id: number;
  bondName: string;
  bondDescription: string;
  stake: string;
  stakeTokenAddress: string;
  stakeTokenLogo: string;
  stakeDecimals: number;
  stakeMaxAmountReached: boolean;
  farm: string;
  farmTokenAddress: string;
  farmTokenLogo: string;
  /*farmStartTime: number;
  farmEndTime: number;*/
  farmDecimals: number;
  // entryEndTime: number;
  entryStartTime?: number;
  apy: string;
  bondContractAddress: string;
  farmDurationTimeDisplayStr$?: Observable<string>;
  entryEndTime$?: Observable<number>;
  status$?: Observable<BondSaleStatus>;
  times$?: Observable<BondTimes>;
  stakedBalanceUpdate?: Subject<void>;
  stakedBalanceReturn$?: Observable<{
    bond: Bond;
    staked: number;
    currentInterestReturn: number;
    totalInterestReturn: number;
  }>;
  timeLeftToExpired$?: Observable<string>;
}

export interface BondTimes {
  entryStartTime: number;
  entryEndTime: number;
  farmStartTime: number;
  farmEndTime: number;
}

export enum BondSaleStatus {
  EARLY = 'EARLY',
  OPEN = 'OPEN',
  FILLED = 'FILLED',
  FARM = 'FARM',
  COMPLETE = 'COMPLETE',
}

export class ErrorDisplay {
  get length(): number {
    return 0;
  }

  constructor(public errMessage: string, public errCode?: string) {
    console.log('ErrorDisplay ERROR MSG =', errMessage, errCode);
  }
}

export enum BASKET_POS_ERR_TYPES {
  BAL_POOL = 'BAL_POOL',
  UNI_POOL_v2 = 'UNI_POOL_v2',
  TOKEN = 'TOKEN',
  MOONI_POOL = 'MOONI_POOL',
}

export interface BasketPositionError {
  type: string;
  positionIdent: string;
}
