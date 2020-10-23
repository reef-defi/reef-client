import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisclaimerModalComponent } from './disclaimer-modal.component';

describe('DisclaimerModalComponent', () => {
  let component: DisclaimerModalComponent;
  let fixture: ComponentFixture<DisclaimerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisclaimerModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisclaimerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
