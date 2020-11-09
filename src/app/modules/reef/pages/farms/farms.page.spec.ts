import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmsPage } from './farms.page';

describe('FarmsPage', () => {
  let component: FarmsPage;
  let fixture: ComponentFixture<FarmsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FarmsPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
