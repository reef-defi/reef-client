import {Component, Inject, LOCALE_ID} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {filter, map, mapTo, shareReplay} from 'rxjs/operators';
import {UniswapService} from '../../../../core/services/uniswap.service';
import {AddressUtils} from '../../../../shared/utils/address.utils';
import {BehaviorSubject, Observable} from 'rxjs';
import {IProviderUserInfo, TokenSymbol} from '../../../../core/models/types';
import {ConnectorService} from '../../../../core/services/connector.service';
import {combineLatest} from 'rxjs/internal/observable/combineLatest';
import {startWith} from 'rxjs/internal/operators/startWith';
import {Contract} from 'web3-eth-contract';
import {ApiService} from '../../../../core/services/api.service';
import {switchMap} from 'rxjs/internal/operators/switchMap';
import {TokenUtil} from '../../../../shared/utils/token.util';
import {of} from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-farm-page',
  templateUrl: './farm.page.html',
  styleUrls: ['./farm.page.scss']
})
export class FarmPage {
  public farmTokenAmount = null;
  // public apy = 0;
  // public apy$: Observable<number>;
  public loading = false;
  // readonly loading$ = new BehaviorSubject(false);
  public TokenSymbol = TokenSymbol;
  public TokenUtil = TokenUtil;
  // readonly providerUserInfo$ = this.connectorSerivce.providerUserInfo$;
  // readonly farmingContract$ = this.uniswapService.farmingContract$;
  readonly farmingContract$ = this.uniswapService.farmingContract$.pipe(
    filter(v => !!v),
    shareReplay(1)
  );
  // readonly lpContract$ = new BehaviorSubject<Contract | null>(null);
  // readonly reefReward$ = new BehaviorSubject<number | null>(null);
  // readonly stakedAmount$ = new BehaviorSubject<string | null>(null);
  readonly walletAddress$ = this.connectorSerivce.providerUserInfo$.pipe(
    filter(v => !!v),
    map((userInfo: IProviderUserInfo) => userInfo.address),
    shareReplay(1)
  );

  readonly refreshBalance = new BehaviorSubject<void>(null);

  readonly contractInfo$: Observable<CInfo> = combineLatest([this.route.params, this.connectorSerivce.providerUserInfo$]).pipe(
    map(([params, info]: [any, IProviderUserInfo]) => {
      const poolTokenAddress = params.address;
      if (!poolTokenAddress) {
        throw new Error('Address not provided');
      }
      const addressTokenSymbol = AddressUtils.getAddressTokenSymbol(info, poolTokenAddress);
      if (!!addressTokenSymbol) {
        // const contract = this.createContract(poolTokenAddress, info);
        // this.getBalances(contract);
        return {address: poolTokenAddress, tokenSymbol: addressTokenSymbol};
      }
      throw new Error('Contract not found =' + poolTokenAddress);
    }),
    shareReplay(1)
  );

  /*readonly tokenSymbol$ = combineLatest([this.contractInfo$, this.connectorSerivce.providerUserInfo$]).pipe(
    map(([address, info]: [string, IProviderUserInfo]) => {
      let contractTokenSymbol = AddressUtils.getAddressTokenSymbol(info, address);
      if (contractTokenSymbol === TokenSymbol.WETH) {
        contractTokenSymbol = TokenSymbol.ETH;
      }
      return contractTokenSymbol;
    }),
    shareReplay(1)
  );*/
  readonly lpContract$ = combineLatest([this.contractInfo$, this.connectorSerivce.providerUserInfo$]).pipe(
    map(
      ([contractInfo, info]: [CInfo, IProviderUserInfo]) => this
        .connectorSerivce.createErc20TokenContract(contractInfo.tokenSymbol, info.availableSmartContractAddresses)),
    filter(v => !!v),
    shareReplay(1)
  );
  readonly tokenBalance$ = combineLatest(
    [this.refreshBalance, this.contractInfo$.pipe(map((v: CInfo) => v.tokenSymbol)), this.connectorSerivce.providerUserInfo$]
  ).pipe(
    switchMap(([_, tokenSymbol, info]: [any, TokenSymbol, IProviderUserInfo]) => this.apiService.getTokenBalance$(info.address, tokenSymbol))
  );
  private readonly poolAddress$ = this.lpContract$.pipe(
    map(lpContract => lpContract.options.address),
    shareReplay(1)
  );
  readonly reefReward$ = combineLatest([this.refreshBalance, this.poolAddress$]).pipe(
    switchMap(([_, poolAddress]: [any, string]) => this.uniswapService.getReefRewards(poolAddress)),
    shareReplay(1)
  );
  readonly stakedAmount$ = combineLatest([this.refreshBalance, this.poolAddress$]).pipe(
    switchMap(([_, poolAddress]: [any, string]) => this.uniswapService.getStaked(poolAddress),
      (poolAddr,staked)=>({poolAddress: poolAddr, staked: staked})),
    map((stakedAddr)=>TUv.amount),
    shareReplay(1)
  );
  readonly loading$ = combineLatest([this.tokenBalance$, this.reefReward$, this.stakedAmount$]).pipe(
    mapTo(false),
    startWith(true),
    shareReplay(1)
  );
  readonly apy$ = combineLatest([this.contractInfo$, this.connectorSerivce.providerUserInfo$]).pipe(
    map(([contractInfo, info]: [CInfo, IProviderUserInfo]) => {
      const poolSymbol = AddressUtils.getAddressTokenSymbol(info, contractInfo.address);
      return AddressUtils.getTokenSymbolReefPoolId(poolSymbol);
    }),
    switchMap((pid) => this.getCalcApy$(pid))
  );

  constructor(private readonly route: ActivatedRoute,
              private readonly uniswapService: UniswapService,
              public readonly connectorSerivce: ConnectorService,
              public apiService: ApiService,
              @Inject(LOCALE_ID) private locale: string
  ) {
  }

  /*ngOnInit(): void {
    combineLatest([this.route.params, this.farmingContract$, this.connectorSerivce.providerUserInfo$]).pipe(
      first(([_, cont, info]) => !!cont)
    ).subscribe(([{address}, contract, info]) => {
      const poolSymbol = AddressUtils.getAddressTokenSymbol(info, address);
      const reefPoolId = AddressUtils.getTokenSymbolReefPoolId(poolSymbol);
      this.calcApy(reefPoolId, info);
    });
  }*/

  public async deposit(contract: Contract, poolAddress: string, amount: string): Promise<void> {
    this.loading = true;
    try {
      await this.uniswapService.deposit(contract, poolAddress, amount);
      // await this.getBalances(this.lpContract$.value);
      this.refreshBalance.next(null);
      this.loading = false;
    } catch (e) {
      this.loading = false;
    }
  }

  public async withdraw(poolAddress: string, amount: string | number): Promise<void> {
    this.loading = true;
    try {
      await this.uniswapService.withdraw(poolAddress, amount);
      // await this.getBalances(this.lpContract$.value);
      this.refreshBalance.next(null);
      this.loading = false;
    } catch (e) {
      this.loading = false;
    }
  }

  /*private async getReefRewards(poolAddress: string): Promise<void> {
    const rewards = await this.uniswapService.getReefRewards(poolAddress);
    this.reefReward$.next(rewards);
  }

  private async getStaked(poolAddress: string): Promise<void> {
    const info = await this.uniswapService.getStaked(poolAddress);
    this.stakedAmount$.next(info.amount);
  }*/

  /*private createContract(lpTokenAddr: string, info: IProviderUserInfo): Contract {
    const tokenSymbol = AddressUtils.getAddressTokenSymbol(info, lpTokenAddr);
    const contract = this.connectorSerivce.createErc20TokenContract(tokenSymbol as TokenSymbol, info.availableSmartContractAddresses);
    this.lpContract$.next(contract);
    return contract;
  }*/

  /*private async getBalances(lpContract: Contract): Promise<void> {
    this.providerUserInfo$.pipe(
      take(1)
    ).subscribe(async (info: IProviderUserInfo) => {
      await this.getReefRewards(lpContract.options.address);
      await this.getStaked(lpContract.options.address);
    });
  }*/
  private getCalcApy$(pId: number): Observable<number> {
    return of(0);
    /*
        return combineLatest([this.connectorSerivce.web3$, this.farmingContract$]).pipe(
          take(1),
          switchMap(([web3, contract]: [any, any]) => {
            return from(contract.methods.poolInfo(pId).call()).pipe(
              switchMap(async (res: any) => {
                const {lpToken} = res;
                const tokenContract = new web3.eth.Contract((contractData.lpToken.abi as any), lpToken);
                const totalStaked = tokenContract.methods.balanceOf(contract.options.address).call();
                console.log('TOTOAAA STAKED', totalStaked);
                return totalStaked;
              }),
              switchMap((totalStakedStr: string) => {
                const totalStaked = +totalStakedStr;
                if (totalStaked === 0) {
                  return of(0);
                }
                return from(contract.methods.reefPerBlock().call()).pipe(
                  map((reefPerBlock: any) => {
                    const reward = this.connectorSerivce.fromWei(reefPerBlock);
                    console.log(reward, totalStaked);
                    // console.log('calcd', 1 + Number(reward) * 2409000 / totalStaked);
                    // TODO: How to calculate APY if totalStaked is 0?
                    return 1 + Number(reward) * 2409000 / totalStaked;
                  })
                );
              })
            );
          }),
        );
    */
  }

  /*public async calcApy(pId: number, info: IProviderUserInfo): Promise<number> {
    const {lpToken} = await this.farmingContract$.value.methods.poolInfo(pId).call();
    const web3 = await this.connectorSerivce.web3$.pipe(first()).toPromise();
    const contractData = getContractData(info.availableSmartContractAddresses);
    const tokenContract = new web3.eth.Contract((contractData.lpToken.abi as any), lpToken);
    const totalStaked = await tokenContract.methods.balanceOf(this.farmingContract$.value.options.address).call();
    if (+totalStaked === 0) {
      return this.apy = 0;
    }
    const reward = this.connectorSerivce.fromWei(await this.farmingContract$.value.methods.reefPerBlock().call());
    // TODO: How to calculate APY if totalStaked is 0?
    return this.apy = 1 + Number(reward) * 2409000 / totalStaked;
  }*/

  getSubtitleTokenPart(token: string): string {
    return (token !== 'TOKEN') ? (token + '-REEF') : 'REEF';
  }

  isEnoughTokenBalance(inputValue: any, tokenBalance: any): boolean {
    if (inputValue == null || tokenBalance == null) {
      return false;
    }
    return parseFloat(inputValue) <= parseFloat(tokenBalance);
  }
}

interface CInfo {
  address: string;
  tokenSymbol: TokenSymbol;
}
