import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomInvestModalComponent } from './custom-invest-modal.component';

describe('CustomInvestModalComponent', () => {
  let component: CustomInvestModalComponent;
  let fixture: ComponentFixture<CustomInvestModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomInvestModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomInvestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
