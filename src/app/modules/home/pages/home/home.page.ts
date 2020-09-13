import { Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  providerName$ = this.connectorService.currentProviderName$;
  provider$ = this.connectorService.currentProvider$;
  providerUserInfo$ = this.connectorService.providerUserInfo$;

  constructor(
    private readonly connectorService: ConnectorService) {
  }

  ngOnInit(): void {
  }
}
