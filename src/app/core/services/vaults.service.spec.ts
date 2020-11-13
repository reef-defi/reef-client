import { TestBed } from '@angular/core/testing';

import { VaultsService } from './vaults.service';

describe('VaultsService', () => {
  let service: VaultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VaultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
