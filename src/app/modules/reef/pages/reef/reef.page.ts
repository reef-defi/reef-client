import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../../../core/services/contract.service';

@Component({
  selector: 'app-reef',
  templateUrl: './reef.page.html',
  styleUrls: ['./reef.page.scss']
})
export class ReefPage implements OnInit {

  constructor(private contractService: ContractService) { }

  ngOnInit(): void {
  }

}
