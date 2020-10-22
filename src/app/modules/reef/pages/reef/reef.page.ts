import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../../../core/services/contract.service';

@Component({
  selector: 'app-reef',
  templateUrl: './reef.page.html',
  styleUrls: ['./reef.page.scss']
})
export class ReefPage implements OnInit {
  readonly reefToken$ = this.contractService.reefTokenContract$;
  readonly reefStaking$ = this.contractService.stakingContract$;

  constructor(private contractService: ContractService) {
  }

  ngOnInit(): void {
  }

  async stakeReef(amount: number): Promise<void> {
    const canStake = await this.contractService.approveToken(
      this.reefToken$.value,
      this.reefStaking$.value.options.address
    );
    if (canStake) {
      await this.contractService.stakeReef(amount);
    }
  }
}
