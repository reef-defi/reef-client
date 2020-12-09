import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketTypesPage } from './basket-types.page';

describe('BasketTypesPage', () => {
  let component: BasketTypesPage;
  let fixture: ComponentFixture<BasketTypesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasketTypesPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketTypesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
