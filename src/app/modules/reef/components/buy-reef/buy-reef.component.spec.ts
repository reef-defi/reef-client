import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyReefComponent } from './buy-reef.component';

describe('BuyReefComponent', () => {
  let component: BuyReefComponent;
  let fixture: ComponentFixture<BuyReefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuyReefComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyReefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
