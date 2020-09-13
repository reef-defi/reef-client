import { Component } from '@angular/core';
import { ConnectorService } from './core/services/connector.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  providerName$ = this.connectorService.currentProviderName$;
  provider$ = this.connectorService.currentProvider$;
  providerUserInfo$ = this.connectorService.providerUserInfo$;
  constructor(private readonly connectorService: ConnectorService) {
  }
}
