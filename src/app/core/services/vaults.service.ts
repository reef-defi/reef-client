import { Injectable } from '@angular/core';
import { ConnectorService } from './connector.service';
import { basketNameGenerator } from '../utils/pools-utils';
import { NotificationService } from './notification.service';
import { IVault, IVaultBasket } from '../models/types';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class VaultsService {
  private readonly vaultsContract$ = this.connectorService.vaultsContract$;
  readonly userInfo = this.connectorService.providerUserInfo$;
  transactionInterval = null;

  constructor(private readonly connectorService: ConnectorService,
              private readonly notificationService: NotificationService,
              private readonly apiService: ApiService) {
  }

  public async getBasketVaults(): Promise<IVaultBasket[]> {
    const basketCount = await this.getAvailableVaultsBasketsCount();
    if (basketCount === '0') {
      return [];
    }
    const basketProms = [];
    for (let i = 0; i <= basketCount; i++) {
      basketProms.push(this.getAvailableBasket(i));
    }
    const allBaskets = await Promise.all(basketProms);
    console.log(allBaskets, 'all..');
    const vaultBaskets = await Promise.all(
      allBaskets.map(async (basket, idx) => ({
        ...basket,
        vaults: await this.getAvailableBasketVaults(idx),
        vaultsBalance: await this.getBalanceOfVaults(idx),
        investedETH: await this.getInvestedAmountInBasket(idx),
        isVault: true,
        index: idx,
      }))
    );
    console.log(vaultBaskets, 'VAULTS_BASKETS');
    return vaultBaskets
      .filter((basket: IVaultBasket) => +basket.investedETH > 0 && basket.referrer === this.userInfo.value.address);
  }

  public async createBasketVaults(vaults: string[], vaultsWeights: number[], vaultsTypes: number[], amount: number
  ): Promise<any> {
    const wei = this.connectorService.toWei(amount);
    const name = basketNameGenerator();
    const adjustedWeights = this.adjustWeights(vaultsWeights);
    console.log(adjustedWeights, 'adjusted.');
    try {
      console.log(name, 'name');
      const res = await this.vaultsContract$.value.methods.createBasket(
        name, vaults, vaultsWeights, vaultsTypes
      ).send({
        from: this.userInfo.value.address,
        gas: 6721975,
        value: `${wei}`
      });
      this.transactionInterval = setInterval(async () =>
        await this.checkIfTransactionSuccess(res, [], `Vault created! Tx hash: ${res.transactionHash}`), 1000);
    } catch (e) {
      this.notificationService.showNotification('The transaction did not go through.', 'Close', 'error');
    }
  }

  public async disinvestFromVaults(basketIdx: number, percent: number, yieldRatio: number, shouldRestake: boolean): Promise<any> {
    try {
      const res = await this.vaultsContract$.value.methods.disinvest(basketIdx, percent, yieldRatio, shouldRestake).send({
        from: this.userInfo.value.address,
        gas: 6721975,
      });
      this.transactionInterval = setInterval(async () =>
        await this.checkIfTransactionSuccess(res, [], `Successfully disinvested! Tx hash: ${res.transactionHash}`), 1000);
    } catch (e) {
      this.notificationService.showNotification('The transaction did not go through', 'Close', 'error');

    }
  }

  private async getAvailableVaultsBasketsCount(): Promise<any> {
    return await this.vaultsContract$.value.methods.availableBasketsSize().call();
  }

  private getAvailableBasket(basketIdx: number): Promise<any> {
    return this.vaultsContract$.value.methods.availableBaskets(basketIdx).call();
  }

  private async getBalanceOfVaults(basketIdx: number): Promise<any> {
    const balance: string[] = await this.vaultsContract$.value.methods.balanceOfVaults(
      this.userInfo.value.address, basketIdx
    ).call();
    return balance.map(vaultBalance => this.connectorService.fromWei(vaultBalance));
  }

  private async getInvestedAmountInBasket(basketIdx: number): Promise<string> {
    const invested: string = await this.vaultsContract$.value.methods.investedAmountInBasket(
      this.userInfo.value.address,
      basketIdx
    ).call();
    return this.connectorService.fromWei(invested);
  }

  private async getAvailableBasketVaults(basketIdx: number): Promise<any> {
    const allVaults = this.apiService.vaults$.value;
    console.log(allVaults, 'allVaults');
    const vaults: { [key: number]: string[] } = await this.vaultsContract$.value.methods.getAvailableBasketVaults(basketIdx).call();
    const vaultsInfo = vaults[0].map((addr: string, i: number) => ({
      name: this.getVaultKey(allVaults, addr) || `Vault ${i}`,
      address: addr,
    }));
    return {
      vaults: vaultsInfo,
      weights: vaults[1],
      types: vaults[2],
    };
  }

  private adjustWeights(weights: number[]): number[] {
    const sum = weights.reduce((memo, curr) => memo + curr);
    if (sum === 100) {
      return weights;
    }
    let max = Math.max(...weights);
    const idx = weights.indexOf(max);
    max = sum > 100 ? max - (sum - 100) : max + (100 - sum);
    weights[idx] = max;
    return weights;
  }

  private async checkIfTransactionSuccess(tx: any, fns?: string[], text?: string): Promise<any> {
    console.log(tx);
    if (!tx.transactionHash) {
      this.notificationService.showNotification('Something went wrong.', 'Close', 'error');
      clearInterval(this.transactionInterval);
    }
    const receipt = await this.connectorService.getTransactionReceipt(tx.transactionHash);
    if (receipt && receipt.status) {
      if (fns && fns.length) {
        fns.forEach(fn => this[fn]());
      }
      this.notificationService.showNotification(text || `Tx Hash: ${tx.transactionHash}`, 'Okay', 'success');
      const latestTx = await this.connectorService.getTxByHash(tx.transactionHash);
      if (this.connectorService.transactionsForAccount$.value) {
        this.connectorService.transactionsForAccount$.next(
          [...this.connectorService.transactionsForAccount$.value, latestTx]
        );
      }
      clearInterval(this.transactionInterval);
    }
  }

  private getVaultKey(vaults: IVault, address: string): string {
    return Object.keys(vaults)[Object.values(vaults).map(val => val.address).indexOf(address)];
  }
}
