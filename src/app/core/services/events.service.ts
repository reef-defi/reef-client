import { Injectable } from '@angular/core';
import { ConnectorService } from './connector.service';
import { ContractService } from './contract.service';
import { first } from 'rxjs/internal/operators/first';
import { Contract } from 'web3-eth-contract';
import { ApiService } from './api.service';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  constructor(
    private readonly connectorService: ConnectorService,
    private readonly apiService: ApiService
  ) {}

  public async subToInvestEvent(contract: Contract) {
    this.subToEvent(contract, 'Invest', (ev, timeStamp) => {
      console.log('Event = ', ev, timeStamp);
      const { basketId, investedAmount, user } = ev.returnValues;
      this.apiService
        .createBasketEntry({
          address: user,
          amount: investedAmount,
          basketIdx: parseInt(basketId),
          timeStamp,
        })
        .pipe(take(1))
        .subscribe();
    });
  }

  private subToEvent(
    contract: Contract,
    event: string,
    cb: (ev: any, timeStamp: number) => any
  ) {
    return contract.events[event]({}, async (err, ev) => {
      const timeStamp = await this.getEventTimestamp(ev);
      cb(ev, timeStamp);
    });
  }

  private async getEventTimestamp(event): Promise<number> {
    const web3 = await this.connectorService.getWeb3();
    const { blockNumber } = event;
    const blockData = await web3.eth.getBlock(blockNumber);
    return blockData.timestamp;
  }
}
