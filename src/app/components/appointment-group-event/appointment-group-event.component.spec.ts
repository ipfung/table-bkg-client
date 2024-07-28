import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentGroupEventComponent } from './appointment-group-event.component';

describe('AppointmentGroupEventComponent', () => {
  let component: AppointmentGroupEventComponent;
  let fixture: ComponentFixture<AppointmentGroupEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentGroupEventComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentGroupEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
