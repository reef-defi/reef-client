import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketCompositionComponent } from './basket-composition.component';

describe('BasketCompositionComponent', () => {
  let component: BasketCompositionComponent;
  let fixture: ComponentFixture<BasketCompositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BasketCompositionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketCompositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
