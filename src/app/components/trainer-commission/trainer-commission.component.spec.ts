import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerCommissionComponent } from './trainer-commission.component';

describe('TrainerCommissionComponent', () => {
  let component: TrainerCommissionComponent;
  let fixture: ComponentFixture<TrainerCommissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainerCommissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainerCommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
