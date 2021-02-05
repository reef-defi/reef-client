import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketRoiComponent } from './basket-roi.component';

describe('BasketRoiComponent', () => {
  let component: BasketRoiComponent;
  let fixture: ComponentFixture<BasketRoiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BasketRoiComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketRoiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
