import { TestBed } from '@angular/core/testing';

import { BasketsService } from './baskets.service';

describe('BasketsService', () => {
  let service: BasketsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BasketsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
