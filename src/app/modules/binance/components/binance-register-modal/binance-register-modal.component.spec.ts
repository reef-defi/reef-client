import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinanceRegisterModalComponent } from './binance-register-modal.component';

describe('BinanceRegisterModalComponent', () => {
  let component: BinanceRegisterModalComponent;
  let fixture: ComponentFixture<BinanceRegisterModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BinanceRegisterModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BinanceRegisterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
