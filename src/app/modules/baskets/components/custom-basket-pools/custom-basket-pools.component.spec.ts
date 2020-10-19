import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomBasketPoolsComponent } from './custom-basket-pools.component';

describe('CustomBasketPoolsComponent', () => {
  let component: CustomBasketPoolsComponent;
  let fixture: ComponentFixture<CustomBasketPoolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomBasketPoolsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomBasketPoolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
