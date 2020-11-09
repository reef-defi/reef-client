import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoolPage } from './pool.page';

describe('PoolPage', () => {
  let component: PoolPage;
  let fixture: ComponentFixture<PoolPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoolPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoolPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
