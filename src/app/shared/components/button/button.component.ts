import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() text: string;
  @Input() inverse = false;
  @Output() click = new EventEmitter();

  onClick(): void {
    this.click.emit();
  }
}
