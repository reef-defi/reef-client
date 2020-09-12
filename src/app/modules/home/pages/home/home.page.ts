import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../../../core/services/web3.service';
import { ConnectorService } from '../../../../core/services/connector.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  readonly isMetaMaskConnected = this.web3Service.isMetaMaskConnected;
  userBalance: string;

  constructor(
    private readonly web3Service: Web3Service,
    private readonly connectorService: ConnectorService) {
  }

  ngOnInit(): void {
    if (this.isMetaMaskConnected) {
      this.web3Service.getUserBalance().then(res => this.userBalance = res);
    }
  }

  async requestEnableMetaMask(): Promise<any> {
    await this.web3Service.enableMetaMaskAccount();
    await this.getUserBalance();
  }

  async getUserBalance(): Promise<string> {
    return this.userBalance = await this.web3Service.getUserBalance();
  }

  async connectToWalletConnect() {
    await this.connectorService.walletConnectInit();
  }

}
