import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StakePage } from './stake.page';

describe('StakePage', () => {
  let component: StakePage;
  let fixture: ComponentFixture<StakePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StakePage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StakePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
