import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentStepsComponent } from './appointment-steps.component';

describe('AppointmentStepsComponent', () => {
  let component: AppointmentStepsComponent;
  let fixture: ComponentFixture<AppointmentStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentStepsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
