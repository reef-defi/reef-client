import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBasketPage } from './create-basket.page';

describe('CreateBasketPage', () => {
  let component: CreateBasketPage;
  let fixture: ComponentFixture<CreateBasketPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateBasketPage],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBasketPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
