import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-address-shortener',
  templateUrl: './address-shortener.component.html',
  styleUrls: ['./address-shortener.component.scss']
})
export class AddressShortenerComponent {
  @Input() address: string | null;
  @Input() standalone = true;
  @Input() showCopy = true;
  constructor() { }
}
