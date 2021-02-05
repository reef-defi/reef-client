import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VaultsRoiChartComponent } from './vaults-roi-chart.component';

describe('VaultsRoiChartComponent', () => {
  let component: VaultsRoiChartComponent;
  let fixture: ComponentFixture<VaultsRoiChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VaultsRoiChartComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VaultsRoiChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
