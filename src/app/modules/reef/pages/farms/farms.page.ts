import {Component} from '@angular/core';
import {ContractService} from '../../../../core/services/contract.service';
import {UniswapService} from '../../../../core/services/uniswap.service';
import {ConnectorService} from '../../../../core/services/connector.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-farm-reef',
  templateUrl: './farms.page.html',
  styleUrls: ['./farms.page.scss']
})
export class FarmsPage {
  farms$ = this.connectorService.providerUserInfo$.pipe(
    map(info => {
      return [
        {
          name: 'Farm REEF',
          description: `
      Stake your REEF Tokens into a
      <strong class="font-weight-bold">Pure REEF</strong>
      farm to earn
      <strong class="font-weight-bold">REEF returns!</strong>`,
          link: info.availableSmartContractAddresses.PURE_REEF_POOL,
          btnLabel: 'Farm REEF',
          imgs: [
            'reef/reef-token.svg'
          ]
        },
        {
          name: 'ETH & REEF',
          description: `
      Stake your LP Tokens into
      <strong class="font-weight-bold">ETH-REEF</strong>
      pool to earn
      <strong class="font-weight-bold">REEF tokens</strong>`,
          link: info.availableSmartContractAddresses.REEF_WETH_POOL,
          btnLabel: 'Stake into ETH/REEF',
          imgs: [
            'eth.png',
            'reef/reef-token.svg'
          ]
        },
        {
          name: 'USDT & REEF',
          description: `
      Stake your LP Tokens into
      <strong class="font-weight-bold">USDT-REEF</strong>
      pool to earn
      <strong class="font-weight-bold">REEF tokens</strong>`,
          link: info.availableSmartContractAddresses.REEF_USDT_POOL,
          btnLabel: 'Stake into USDT/REEF',
          imgs: [
            'usdt.png',
            'reef/reef-token.svg'
          ]
        }
      ];
    })
  );

  constructor(private readonly contractService: ContractService,
              private readonly uniswapService: UniswapService,
              private connectorService: ConnectorService
  ) {
  }
}
