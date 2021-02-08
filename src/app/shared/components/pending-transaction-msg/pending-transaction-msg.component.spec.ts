import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingTransactionMsgComponent } from './pending-transaction-msg.component';

describe('PendingTransactionMsgComponent', () => {
  let component: PendingTransactionMsgComponent;
  let fixture: ComponentFixture<PendingTransactionMsgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PendingTransactionMsgComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingTransactionMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
