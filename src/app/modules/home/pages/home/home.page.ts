import { Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {

  constructor(
    private readonly connectorService: ConnectorService) {
  }

  ngOnInit(): void {
  }

  onConnect(): void {
    this.connectorService.onConnect();
  }

  onDisconnect(): void {
    this.connectorService.onDisconnect();
  }
}
