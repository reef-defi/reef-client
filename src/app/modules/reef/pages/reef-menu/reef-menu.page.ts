import { Component, OnInit } from '@angular/core';
import { ConnectorService } from '../../../../core/services/connector.service';

@Component({
  selector: 'app-reef-menu',
  templateUrl: './reef-menu.page.html',
  styleUrls: ['./reef-menu.page.scss']
})
export class ReefMenuPage implements OnInit {
  readonly providerUserInfo$ = this.connectorService.providerUserInfo$;
  constructor(private readonly connectorService: ConnectorService) { }

  ngOnInit(): void {
  }

}
