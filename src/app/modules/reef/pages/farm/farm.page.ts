import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {filter, finalize, first, map} from 'rxjs/operators';
import {UniswapService} from '../../../../core/services/uniswap.service';
import {addresses, reefPools} from '../../../../../assets/addresses';
import {tap} from 'rxjs/internal/operators/tap';
import {BehaviorSubject} from 'rxjs';
import {IContract, IProviderUserInfo} from '../../../../core/models/types';
import {getKey} from '../../../../core/utils/pools-utils';
import {ConnectorService} from '../../../../core/services/connector.service';
import {contractData} from '../../../../../assets/abi';
import {combineLatest} from "rxjs/internal/observable/combineLatest";

@Component({
  selector: 'app-farm-page',
  templateUrl: './farm.page.html',
  styleUrls: ['./farm.page.scss']
})
export class FarmPage implements OnInit {
  public reefAmount = 0;
  public apy = 0;
  public loading = false;
  readonly providerUserInfo$ = this.connectorSerivce.providerUserInfo$;
  readonly farmingContract$ = this.uniswapService.farmingContract$;
  readonly web3 = this.connectorSerivce.web3;
  readonly loading$ = new BehaviorSubject(false);
  readonly lpContract$ = new BehaviorSubject<IContract | null>(null);
  readonly tokenBalance$ = new BehaviorSubject<string | null>(null);
  readonly reefReward$ = new BehaviorSubject<number | null>(null);
  readonly tokenSymbol$ = new BehaviorSubject<string | null>(null);
  readonly stakedAmount$ = new BehaviorSubject<string | null>(null);
  readonly address$ = this.route.params.pipe(
    first(addr => !!addr),
    map((params) => params.address),
    tap(() => this.loading$.next(true)),
    filter(this.uniswapService.isSupportedERC20),
    tap((address: string) => {
      console.log(address, 'this is from obs')
      this.tokenSymbol$.next(getKey(addresses, address).split('_')[1]);
      const validAddrs = Object.values(addresses);
      if (validAddrs.includes(address)) {
        const contract = this.createContract(address);
        this.getBalances(contract);
      }
    }),
    finalize(() => this.loading$.next(false))
  );

  constructor(private readonly route: ActivatedRoute,
              private readonly uniswapService: UniswapService,
              private readonly connectorSerivce: ConnectorService) {
  }

  ngOnInit(): void {
    combineLatest(this.route.params, this.farmingContract$).pipe(
      first(([_, cont]) => !!cont)
    ).subscribe(([{address}, contract]) => {
      const key = getKey(addresses, address);
      const pId = reefPools[key];
      this.calcApy(pId);
    });
  }

  public async deposit(contract: IContract, poolAddress: string, amount: string): Promise<void> {
    this.loading = true;
    try {
      await this.uniswapService.deposit(contract, poolAddress, amount);
      await this.getBalances(this.lpContract$.value);
      this.loading = false
    } catch (e) {
      this.loading = false;
    }
  }

  public async withdraw(poolAddress: string, amount: string | number): Promise<void> {
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

  private async getBalance(lpContract: IContract, address: string): Promise<void> {
    const balance = await this.uniswapService.getBalanceOf(lpContract, address);
    this.tokenBalance$.next(balance);
  }

  private createContract(lpTokenAddr: string): IContract {
    const tokenSymbol = getKey(addresses, lpTokenAddr);
    const contract = this.uniswapService.createLpContract(tokenSymbol);
    this.lpContract$.next(contract);
    return contract;
  }

  private async getBalances(lpContract: IContract): Promise<void> {
    this.providerUserInfo$.pipe(
      first(ev => !!ev)
    ).subscribe(async (info: IProviderUserInfo) => {
      console.log(lpContract.options.address, 'this is from getBalances')
      await this.getBalance(lpContract, info.address);
      await this.getReefRewards(lpContract.options.address);
      await this.getStaked(lpContract.options.address);
    });
  }

  public async calcApy(pId: number): Promise<number> {
    const {lpToken} = await this.farmingContract$.value.methods.poolInfo(pId).call();
    console.log(lpToken, 'hmm')
    const tokenContract = new this.web3.eth.Contract((contractData.lpToken.abi as any), lpToken);
    const totalStaked = await tokenContract.methods.balanceOf(this.farmingContract$.value.options.address).call();
    console.log(totalStaked)
    if (totalStaked == 0) {
      return this.apy = 0;
    }
    const reward = this.connectorSerivce.fromWei(await this.farmingContract$.value.methods.reefPerBlock().call());
    console.log(reward, totalStaked)
    console.log('calcd', 1 + Number(reward) * 2409000 / totalStaked)
    // TODO: How to calculate APY if totalStaked is 0?
    return this.apy = 1 + Number(reward) * 2409000 / totalStaked;
  }
}
