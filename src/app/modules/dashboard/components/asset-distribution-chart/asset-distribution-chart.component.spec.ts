import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetDistributionChartComponent } from './asset-distribution-chart.component';

describe('AssetDistributionChartComponent', () => {
  let component: AssetDistributionChartComponent;
  let fixture: ComponentFixture<AssetDistributionChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssetDistributionChartComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetDistributionChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
