import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
})
export class EmptyStateComponent {
  @Input() title: string | undefined;
  @Input() subtitle: string | undefined;
  @Input() showCtaButton: boolean | undefined;
  @Input() ctaButtonText: string | undefined;
  @Output() cta = new EventEmitter();
  constructor() {}

  onCta(): void {
    this.cta.emit();
  }
}
