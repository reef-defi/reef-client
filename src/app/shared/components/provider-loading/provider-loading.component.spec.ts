import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderLoadingComponent } from './provider-loading.component';

describe('ProviderLoadingComponent', () => {
  let component: ProviderLoadingComponent;
  let fixture: ComponentFixture<ProviderLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProviderLoadingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
