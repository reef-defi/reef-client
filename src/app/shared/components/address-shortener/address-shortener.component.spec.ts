import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressShortenerComponent } from './address-shortener.component';

describe('AddressShortenerComponent', () => {
  let component: AddressShortenerComponent;
  let fixture: ComponentFixture<AddressShortenerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddressShortenerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressShortenerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
