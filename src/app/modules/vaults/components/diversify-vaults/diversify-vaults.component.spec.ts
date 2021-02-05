import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiversifyVaultsComponent } from './diversify-vaults.component';

describe('DiversifyVaultsComponent', () => {
  let component: DiversifyVaultsComponent;
  let fixture: ComponentFixture<DiversifyVaultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DiversifyVaultsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiversifyVaultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
