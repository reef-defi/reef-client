import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmPage } from './farm.page';

describe('FarmPage', () => {
  let component: FarmPage;
  let fixture: ComponentFixture<FarmPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FarmPage],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
