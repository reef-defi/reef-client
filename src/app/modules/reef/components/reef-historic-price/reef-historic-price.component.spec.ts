import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReefHistoricPriceComponent } from './reef-historic-price.component';

describe('ReefHistoricPriceComponent', () => {
  let component: ReefHistoricPriceComponent;
  let fixture: ComponentFixture<ReefHistoricPriceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReefHistoricPriceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReefHistoricPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
