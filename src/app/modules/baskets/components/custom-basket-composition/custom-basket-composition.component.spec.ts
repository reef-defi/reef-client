import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomBasketCompositionComponent } from './custom-basket-composition.component';

describe('CustomBasketCompositionComponent', () => {
  let component: CustomBasketCompositionComponent;
  let fixture: ComponentFixture<CustomBasketCompositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomBasketCompositionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomBasketCompositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
