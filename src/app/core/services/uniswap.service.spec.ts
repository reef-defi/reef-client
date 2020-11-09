import { TestBed } from '@angular/core/testing';

import { UniswapService } from './uniswap.service';

describe('UniswapService', () => {
  let service: UniswapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniswapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
