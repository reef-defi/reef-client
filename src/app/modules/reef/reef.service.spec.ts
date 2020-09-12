import { TestBed } from '@angular/core/testing';

import { ReefService } from './reef.service';

describe('ReefService', () => {
  let service: ReefService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReefService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
