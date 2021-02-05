import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VaultsCompositionComponent } from './vaults-composition.component';

describe('VaultsCompositionComponent', () => {
  let component: VaultsCompositionComponent;
  let fixture: ComponentFixture<VaultsCompositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VaultsCompositionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VaultsCompositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
