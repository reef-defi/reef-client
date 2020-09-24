import { TestBed } from '@angular/core/testing';

import { WalletGuard } from './wallet.guard';

describe('WalletGuard', () => {
  let guard: WalletGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(WalletGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
