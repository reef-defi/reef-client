import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StakeReefComponent } from './stake-reef.component';

describe('StakeReefComponent', () => {
  let component: StakeReefComponent;
  let fixture: ComponentFixture<StakeReefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StakeReefComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StakeReefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
