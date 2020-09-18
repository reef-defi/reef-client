import { Injectable } from '@angular/core';
import { contractData } from '../../../assets/abi';
import { ConnectorService } from './connector.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  contract$ = new BehaviorSubject(null);

  constructor(private readonly connectorService: ConnectorService) {
  }

  connectToContract(): void {
    const contract = new this.connectorService.web3.eth.Contract((contractData.abi as any), contractData.addr);
    this.contract$.next(contract);
  }

  getAvailableBasketsCount(): Promise<any> {
    return this.contract$.value.methods.getAvailableBasketsCount().call();
  }
}
