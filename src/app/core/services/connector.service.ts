import { Injectable } from '@angular/core';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import connectorsData from '../models/CONNECTORS_DATA';

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  walletConnector = null;

  constructor() {
  }

  public async walletConnectInit(): Promise<any> {
    this.walletConnector = new WalletConnect({bridge: connectorsData.walletConnectBridge, qrcodeModal: QRCodeModal});
    if (!this.walletConnector.connected) {
      await this.walletConnector.createSession();
    }

    await this.initWCEvents();
  }

  public initWCEvents(): any {
    if (!this.walletConnector) {
      return;
    }

    this.walletConnector.on('connect', (error, payload) => {
      console.log(`connector.on("connect")`);

      if (error) {
        throw error;
      }

      console.log(payload);
    });
  }
}
