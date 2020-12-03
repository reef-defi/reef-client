import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyCryptoPage } from './buy-crypto.page';

describe('BuyCryptoPage', () => {
  let component: BuyCryptoPage;
  let fixture: ComponentFixture<BuyCryptoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuyCryptoPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyCryptoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
