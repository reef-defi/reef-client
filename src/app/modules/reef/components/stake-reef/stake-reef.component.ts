import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-stake-reef',
  templateUrl: './stake-reef.component.html',
  styleUrls: ['./stake-reef.component.scss']
})
export class StakeReefComponent {
  @Output() stake = new EventEmitter();
  constructor() { }

  onStake(): void {
    this.stake.emit();
  }
}
