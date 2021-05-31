import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BridgePage } from './bridge.page';

describe('BridgeComponent', () => {
  let component: BridgePage;
  let fixture: ComponentFixture<BridgePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BridgePage],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
