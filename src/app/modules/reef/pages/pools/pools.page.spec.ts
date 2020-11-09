import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolsPage } from './pools.page';

describe('PoolsPage', () => {
  let component: PoolsPage;
  let fixture: ComponentFixture<PoolsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoolsPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
