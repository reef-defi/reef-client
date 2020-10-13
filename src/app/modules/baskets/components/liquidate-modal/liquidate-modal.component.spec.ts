import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidateModalComponent } from './liquidate-modal.component';

describe('LiquidateModalComponent', () => {
  let component: LiquidateModalComponent;
  let fixture: ComponentFixture<LiquidateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiquidateModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
