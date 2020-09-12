import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../../../core/services/web3.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  userBalance: string;

  constructor(private readonly web3Service: Web3Service) {
  }

  ngOnInit(): void {
    if (this.web3Service.isMetaMaskConnected) {
      this.web3Service.getUserBalance().then(res => this.userBalance = res)
    }
  }

  async requestEnableMetaMask(): Promise<any> {
    await this.web3Service.enableMetaMaskAccount();
    await this.getBalance();
  }

  async getBalance(): Promise<any> {
    return this.userBalance = await this.web3Service.getUserBalance();
  }

}
