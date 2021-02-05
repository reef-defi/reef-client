import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketsPage } from './baskets.page';

describe('BasketsPage', () => {
  let component: BasketsPage;
  let fixture: ComponentFixture<BasketsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BasketsPage],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
