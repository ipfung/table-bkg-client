import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceStatusComponent } from './finance-status.component';

describe('FinanceStatusComponent', () => {
  let component: FinanceStatusComponent;
  let fixture: ComponentFixture<FinanceStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinanceStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
