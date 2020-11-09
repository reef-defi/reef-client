import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, finalize, first, map } from 'rxjs/operators';
import { UniswapService } from '../../../../core/services/uniswap.service';
import { addresses } from '../../../../../assets/addresses';
import { tap } from 'rxjs/internal/operators/tap';
import { BehaviorSubject } from 'rxjs';
import { IContract, IProviderUserInfo } from '../../../../core/models/types';
import { getKey } from '../../../../core/utils/pools-utils';
import { ConnectorService } from '../../../../core/services/connector.service';

@Component({
  selector: 'app-farm-page',
  templateUrl: './farm.page.html',
  styleUrls: ['./farm.page.scss']
})
export class FarmPage implements OnInit {
  readonly providerUserInfo$ = this.connectorSerivce.providerUserInfo$;
  readonly loading$ = new BehaviorSubject(false);
  readonly lpContract$ = new BehaviorSubject<IContract | null>(null);
  readonly tokenBalance$ = new BehaviorSubject<string | null>(null);
  readonly reefReward$ = new BehaviorSubject<number | null>(null);
  readonly address$ = this.route.params.pipe(
    first(addr => !!addr),
    map((params) => params.address),
    tap(() => this.loading$.next(true)),
    filter(this.uniswapService.isSupportedERC20),
    tap((address: string) => {
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
  }

  public async deposit(contract: IContract, poolAddress: string, amount: string): Promise<void> {
    await this.uniswapService.deposit(contract, poolAddress, amount);
  }

  public async withdraw(poolAddress: string, amount: string): Promise<void> {
    await this.uniswapService.withdraw(poolAddress, amount);
  }

  private async getReefRewards(poolAddress: string): Promise<void> {
    const rewards = await this.uniswapService.getReefRewards(poolAddress);
    this.reefReward$.next(rewards);
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
      await this.getBalance(lpContract, info.address);
      await this.getReefRewards(lpContract.options.address);
    });
  }
}
