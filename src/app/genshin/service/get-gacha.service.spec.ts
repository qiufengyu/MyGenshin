import { TestBed } from '@angular/core/testing';

import { GetGachaService } from './get-gacha.service';

describe('GetGachaService', () => {
  let service: GetGachaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetGachaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
