import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-buy-reef',
  templateUrl: './buy-reef.component.html',
  styleUrls: ['./buy-reef.component.scss']
})
export class BuyReefComponent {
  @Output() buy = new EventEmitter();
  constructor() { }

  onBuy(): void {
    this.buy.emit();
  }
}
