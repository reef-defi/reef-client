import { Injectable } from '@angular/core';
import { ConnectorService } from './connector.service';
import { BehaviorSubject } from 'rxjs';
import { NotificationService } from './notification.service';
import {
  IBasket,
  IBasketPoolsAndCoinInfo,
  IProviderUserInfo,
} from '../models/types';
import { getBasketPoolNames } from '../utils/pools-utils';
import { ApiService } from './api.service';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  basketContract$ = this.connectorService.basketContract$;
  farmingContract$ = this.connectorService.farmingContract$;
  stakingContract$ = this.connectorService.stakingContract$;
  reefTokenContract$ = this.connectorService.reefTokenContract$;
  baskets$ = new BehaviorSubject<IBasket[] | null>(null);
  readonly basketsError$ = new BehaviorSubject(null);
  readonly loading$ = new BehaviorSubject(false);
  transactionInterval = null;

  constructor(
    private readonly connectorService: ConnectorService,
    private readonly notificationService: NotificationService,
    private readonly apiService: ApiService
  ) {}

  async getAllBaskets(): Promise<any> {
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    this.loading$.next(true);
    try {
      const basketCount = await this.getAvailableBasketsCount();
      const basketProms = [];
      for (let i = 0; i <= basketCount; i++) {
        basketProms.push(this.getAvailableBasket(i));
      }
      const resolvedBaskets = await Promise.all(basketProms);
      let baskets: IBasket[] = await Promise.all(
        resolvedBaskets.map(async (basket, idx) => ({
          ...basket,
          investedETH: await this.getUserInvestedBasketAmount(idx),
          ...(await this.getBasketPoolsAndTokens(idx)).reduce((memo, curr) => ({
            ...memo,
            ...curr,
          })),
          index: idx,
          isVault: false,
        }))
      );
      baskets = getBasketPoolNames(
        baskets,
        this.apiService.pools$.value,
        this.apiService.tokens$.value
      ).filter(
        (basket) => +basket.investedETH > 0 && basket.referrer === info.address
      );
      this.baskets$.next(baskets);
      this.basketsError$.next(false);
      this.loading$.next(false);
    } catch (e) {
      this.basketsError$.next(true);
      this.loading$.next(false);
    }
  }

  async resetBaskets(): Promise<any> {
    this.baskets$.next([]);
  }

  getAvailableBasketsCount(): Promise<any> {
    return this.basketContract$.value.methods.availableBasketsSize().call();
  }

  getAvailableBasket(basketIdx: number): Promise<any> {
    return this.basketContract$.value.methods
      .availableBaskets(basketIdx)
      .call();
  }

  async getUserInvestedBasketAmount(idx: number): Promise<any> {
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    const invested: number = await this.basketContract$.value.methods
      .investedAmountInBasket(info.address, idx)
      .call();
    return await this.connectorService.fromWei(invested);
  }

  async createBasket(
    name: string,
    basketPoolTokenInfo: IBasketPoolsAndCoinInfo,
    amountToInvest: number
  ): Promise<any> {
    try {
      const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
        .pipe(take(1))
        .toPromise();
      const wei = this.connectorService.toWei(amountToInvest);
      const {
        uniswapPools,
        tokenPools,
        balancerPools,
        balancerWeights,
        tokenWeights,
        uniSwapWeights,
        mooniswapPools,
        mooniswapWeights,
      } = basketPoolTokenInfo;
      const response = await this.basketContract$.value.methods
        .createBasket(
          name,
          uniswapPools,
          uniSwapWeights,
          tokenPools,
          tokenWeights,
          balancerPools,
          balancerWeights,
          mooniswapPools,
          mooniswapWeights
        )
        .send({
          from: info.address,
          value: `${wei}`,
          gas: 6721975,
        });
      this.transactionInterval = setInterval(
        async () =>
          await this.checkIfTransactionSuccess(response, ['updateUserDetails']),
        1000
      );
    } catch (e) {
      console.error(e);
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  async getBalanceOf(basketIdx): Promise<any> {
    // TODO: get balances of all polls...
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    return this.basketContract$.value.methods
      .getAvailableBasketUniswapPools(basketIdx)
      .call();
  }

  async getBasketPoolsAndTokens(basketIdx: number): Promise<any[]> {
    const fns = [
      'getAvailableBasketUniswapPools',
      'getAvailableBasketTokens',
      'getAvailableBasketBalancerPools',
      'getAvailableBasketMooniswapPools',
    ];
    const unpack = async (fn) => {
      const res = await this.basketContract$.value.methods[fn](
        basketIdx
      ).call();
      return {
        pools: res[0],
        weights: res[1],
      };
    };
    return Promise.all(
      fns.map(async (fn: string) => ({
        [fn.split('Basket')[1]]: await unpack(fn),
      }))
    );
  }

  async disinvestInBasket(
    basketIdxs: number,
    basketIdxPercentage: number,
    yieldRatio: number,
    shouldRestake: boolean
  ): Promise<any> {
    try {
      const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
        .pipe(take(1))
        .toPromise();
      const res = await this.basketContract$.value.methods
        .disinvest(basketIdxs, basketIdxPercentage, yieldRatio, shouldRestake)
        .send({
          from: info.address,
          gas: 6721975,
        });
      this.transactionInterval = setInterval(
        async () =>
          await this.checkIfTransactionSuccess(res, [
            'getAllBaskets',
            'updateUserDetails',
          ]),
        1000
      );
    } catch (e) {
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  async stakeReef(amount: number): Promise<any> {
    try {
      const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
        .pipe(take(1))
        .toPromise();
      const value = this.connectorService.toWei(amount);
      const res = await this.stakingContract$.value.methods.stake(value).send({
        from: info.address,
        gas: 6721975,
      });
      this.transactionInterval = setInterval(
        async () =>
          await this.checkIfTransactionSuccess(res, ['updateUserDetails']),
        1000
      );
    } catch (e) {
      this.notificationService.showNotification(e.message, 'Close', 'error');
    }
  }

  async getMinimalInvestment(): Promise<string> {
    const investment = await this.basketContract$.value.methods
      .minimalInvestment()
      .call();
    return this.connectorService.fromWei(investment as string);
  }

  private async updateUserDetails(): Promise<void> {
    const info: IProviderUserInfo = await this.connectorService.providerUserInfo$
      .pipe(take(1))
      .toPromise();
    //TODO refresh balance
    this.apiService.refreshBalancesForAddress.next(info.address);
    // this is old way of refreshing balance - this.connectorService.getUserProviderInfo();
  }

  private async checkIfTransactionSuccess(
    tx: any,
    fns?: string[]
  ): Promise<any> {
    if (!tx.transactionHash) {
      this.notificationService.showNotification(
        'Something went wrong.',
        'Close',
        'error'
      );
      clearInterval(this.transactionInterval);
    }
    const receipt = await this.connectorService.getTransactionReceipt(
      tx.transactionHash
    );
    if (receipt && receipt.status) {
      if (fns && fns.length) {
        fns.forEach((fn) => this[fn]());
      }
      this.notificationService.showNotification(
        `Tx Hash: ${tx.transactionHash}`,
        'Okay',
        'success'
      );
      const latestTx = await this.connectorService.getTxByHash(
        tx.transactionHash
      );
      if (this.connectorService.transactionsForAccount$.value) {
        this.connectorService.transactionsForAccount$.next([
          ...this.connectorService.transactionsForAccount$.value,
          latestTx,
        ]);
      }
      clearInterval(this.transactionInterval);
    }
  }
}
