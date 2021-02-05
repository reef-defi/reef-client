import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReefPage } from './reef.page';

describe('ReefPage', () => {
  let component: ReefPage;
  let fixture: ComponentFixture<ReefPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReefPage],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReefPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
