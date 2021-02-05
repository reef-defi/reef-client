import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PercentageButtonsComponent } from './percentage-buttons.component';

describe('PercentageButtonsComponent', () => {
  let component: PercentageButtonsComponent;
  let fixture: ComponentFixture<PercentageButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PercentageButtonsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PercentageButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
