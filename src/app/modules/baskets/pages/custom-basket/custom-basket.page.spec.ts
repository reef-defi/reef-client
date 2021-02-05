import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomBasketPage } from './custom-basket.page';

describe('CustomBasketPage', () => {
  let component: CustomBasketPage;
  let fixture: ComponentFixture<CustomBasketPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomBasketPage],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomBasketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
