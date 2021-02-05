import { TestBed } from '@angular/core/testing';

import { CovalentAuthInterceptor } from './covalent-auth.interceptor';

describe('CovalentAuthInterceptor', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [CovalentAuthInterceptor],
    })
  );

  it('should be created', () => {
    const interceptor: CovalentAuthInterceptor = TestBed.inject(
      CovalentAuthInterceptor
    );
    expect(interceptor).toBeTruthy();
  });
});
