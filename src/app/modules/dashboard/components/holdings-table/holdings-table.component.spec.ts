import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldingsTableComponent } from './holdings-table.component';

describe('HoldingsTableComponent', () => {
  let component: HoldingsTableComponent;
  let fixture: ComponentFixture<HoldingsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HoldingsTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldingsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
