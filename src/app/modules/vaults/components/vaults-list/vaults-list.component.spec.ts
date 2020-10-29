import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VaultsListComponent } from './vaults-list.component';

describe('VaultsListComponent', () => {
  let component: VaultsListComponent;
  let fixture: ComponentFixture<VaultsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VaultsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VaultsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
