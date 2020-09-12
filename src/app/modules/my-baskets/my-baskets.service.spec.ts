import { TestBed } from '@angular/core/testing';

import { MyBasketsService } from './my-baskets.service';

describe('MyBasketsService', () => {
  let service: MyBasketsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyBasketsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
