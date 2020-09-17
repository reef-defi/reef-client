import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBasketsPage } from './my-baskets.page';

describe('MyBasketsPage', () => {
  let component: MyBasketsPage;
  let fixture: ComponentFixture<MyBasketsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyBasketsPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyBasketsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
