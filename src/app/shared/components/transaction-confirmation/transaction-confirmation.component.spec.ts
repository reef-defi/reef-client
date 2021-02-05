import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionConfirmationComponent } from './transaction-confirmation.component';

describe('TransactionConfirmationComponent', () => {
  let component: TransactionConfirmationComponent;
  let fixture: ComponentFixture<TransactionConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionConfirmationComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
