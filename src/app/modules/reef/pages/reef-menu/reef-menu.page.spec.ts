import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReefMenuPage } from './reef-menu.page';

describe('ReefMenuPage', () => {
  let component: ReefMenuPage;
  let fixture: ComponentFixture<ReefMenuPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReefMenuPage],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReefMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
