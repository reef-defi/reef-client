import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomBasketComponent } from './custom-basket.component';

describe('CustomBasketComponent', () => {
  let component: CustomBasketComponent;
  let fixture: ComponentFixture<CustomBasketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomBasketComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomBasketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
