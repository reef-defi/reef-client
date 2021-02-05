import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberCounterComponent } from './number-counter.component';

describe('NumberCounterComponent', () => {
  let component: NumberCounterComponent;
  let fixture: ComponentFixture<NumberCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NumberCounterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
