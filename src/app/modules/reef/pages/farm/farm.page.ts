import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first, map, mapTo, shareReplay, take } from 'rxjs/operators';
import { UniswapService } from '../../../../core/services/uniswap.service';
import { AddressUtils } from '../../../../shared/utils/address.utils';
import { BehaviorSubject } from 'rxjs';
import {
  IProviderUserInfo,
  TokenSymbol,
  TransactionType,
} from '../../../../core/models/types';
import { ConnectorService } from '../../../../core/services/connector.service';
import { getContractData } from '../../../../../assets/abi';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { startWith } from 'rxjs/internal/operators/startWith';
import { Contract } from 'web3-eth-contract';
import { ApiService } from '../../../../core/services/api.service';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { TokenUtil } from '../../../../shared/utils/token.util';
import { TransactionsService } from '../../../../core/services/transactions.service';
import {TokenBalanceService} from '../../../../shared/service/token-balance.service';

@Component({
  selector: 'app-farm-page',
  templateUrl: './farm.page.html',
  styleUrls: ['./farm.page.scss'],
})
export class FarmPage implements OnInit {
  TransactionType = TransactionType;
  public reefAmount = null;
  public apy = 0;
  public loading = false;
  public TokenSymbol = TokenSymbol;
  public TokenUtil = TokenUtil;
  readonly pendingTransactions$ = this.transactionService.getPendingTransactions(
    [
      TransactionType.REEF_FARM,
      TransactionType.REEF_USDT_FARM,
      TransactionType.REEF_ETH_FARM,
    ]
  );
  readonly providerUserInfo$ = this.connectorSerivce.providerUserInfo$;
  readonly farmingContract$ = this.uniswapService.farmingContract$;
  readonly lpContract$ = new BehaviorSubject<Contract | null>(null);
  readonly reefReward$ = new BehaviorSubject<number | null>(null);
  readonly stakedAmount$ = new BehaviorSubject<string | null>(null);
  readonly address$ = combineLatest([
    this.route.params,
    this.connectorSerivce.providerUserInfo$,
  ]).pipe(
    map(([params, info]: [any, IProviderUserInfo]) => {
      const poolTokenAddress = params.address;
      if (!poolTokenAddress) {
        throw new Error('Address not provided');
      }
      const addressTokenSymbol = AddressUtils.getAddressTokenSymbol(
        info,
        poolTokenAddress
      );
      if (!!addressTokenSymbol) {
        const contract = this.createContract(poolTokenAddress, info);
        this.getBalances(contract);
        return poolTokenAddress;
      }
      throw new Error('Contract not found =' + poolTokenAddress);
    }),
    shareReplay(1)
  );
  readonly tokenSymbol$ = combineLatest([
    this.address$,
    this.connectorSerivce.providerUserInfo$,
  ]).pipe(
    map(([address, info]: [string, IProviderUserInfo]) => {
      let contractTokenSymbol = AddressUtils.getAddressTokenSymbol(
        info,
        address
      );
      if (contractTokenSymbol === TokenSymbol.WETH) {
        contractTokenSymbol = TokenSymbol.ETH;
      }
      return TokenUtil.parseLPTokenName(contractTokenSymbol);
    })
  );
  readonly tokenBalance$ = combineLatest([
    this.tokenSymbol$,
    this.connectorSerivce.providerUserInfo$,
  ]).pipe(
    switchMap(([tokenSymbol, info]: [TokenSymbol, IProviderUserInfo]) =>
      this.tokenBalanceService.getTokenBalance$(info.address, tokenSymbol)
    )
  );
  readonly loading$ = combineLatest([
    this.tokenBalance$,
    this.reefReward$,
    this.stakedAmount$,
  ]).pipe(mapTo(false), startWith(true), shareReplay(1));

  constructor(
    private readonly route: ActivatedRoute,
    private readonly uniswapService: UniswapService,
    public readonly connectorSerivce: ConnectorService,
    private readonly transactionService: TransactionsService,
    public apiService: ApiService,
    public tokenBalanceService: TokenBalanceService,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.route.params,
      this.farmingContract$,
      this.connectorSerivce.providerUserInfo$,
    ])
      .pipe(first(([_, cont, info]) => !!cont))
      .subscribe(([{ address }, contract, info]) => {
        const poolSymbol = AddressUtils.getAddressTokenSymbol(info, address);
        const reefPoolId = AddressUtils.getTokenSymbolReefPoolId(poolSymbol);
        this.calcApy(reefPoolId, info);
      });
  }

  public async deposit(
    contract: Contract,
    poolAddress: string,
    amount: string
  ): Promise<void> {
    this.loading = true;
    try {
      await this.uniswapService.deposit(contract, poolAddress, amount);
      await this.getBalances(this.lpContract$.value);
      this.loading = false;
    } catch (e) {
      this.loading = false;
    }
  }

  public async withdraw(
    poolAddress: string,
    amount: string | number
  ): Promise<void> {
    this.loading = true;
    try {
      await this.uniswapService.withdraw(poolAddress, amount);
      await this.getBalances(this.lpContract$.value);
      this.loading = false;
    } catch (e) {
      this.loading = false;
    }
  }

  private async getReefRewards(poolAddress: string): Promise<void> {
    const rewards = await this.uniswapService.getReefRewards(poolAddress);
    this.reefReward$.next(rewards);
  }

  private async getStaked(poolAddress: string): Promise<void> {
    const info = await this.uniswapService.getStaked(poolAddress);
    this.stakedAmount$.next(info.amount);
  }

  private createContract(
    lpTokenAddr: string,
    info: IProviderUserInfo
  ): Contract {
    const tokenSymbol = AddressUtils.getAddressTokenSymbol(info, lpTokenAddr);
    const contract = this.connectorSerivce.createErc20TokenContract(
      tokenSymbol as TokenSymbol,
      info.availableSmartContractAddresses
    );
    this.lpContract$.next(contract);
    return contract;
  }

  private async getBalances(lpContract: Contract): Promise<void> {
    this.providerUserInfo$
      .pipe(take(1))
      .subscribe(async (info: IProviderUserInfo) => {
        await this.getReefRewards(lpContract.options.address);
        await this.getStaked(lpContract.options.address);
      });
  }

  public async calcApy(pId: number, info: IProviderUserInfo): Promise<number> {
    const { lpToken } = await this.farmingContract$.value.methods
      .poolInfo(pId)
      .call();
    const web3 = await this.connectorSerivce.web3$.pipe(first()).toPromise();
    const contractData = getContractData(info.availableSmartContractAddresses);
    const tokenContract = new web3.eth.Contract(
      contractData.erc20Token.abi as any,
      lpToken
    );
    const totalStaked = await tokenContract.methods
      .balanceOf(this.farmingContract$.value.options.address)
      .call();
    if (+totalStaked === 0) {
      return (this.apy = 0);
    }
    const reward = this.connectorSerivce.fromWei(
      await this.farmingContract$.value.methods.reefPerBlock().call()
    );
    // TODO: How to calculate APY if totalStaked is 0?
    return (this.apy = 1 + (Number(reward) * 2409000) / totalStaked);
  }

  getSubtitleTokenPart(token: string): string {
    return token !== 'TOKEN' ? token + '-REEF' : 'REEF';
  }

  isEnoughTokenBalance(number: any, number2: any) {
    if (number == null || number2 == null) {
      return false;
    }
    return parseFloat(number) <= parseFloat(number2);
  }
}
