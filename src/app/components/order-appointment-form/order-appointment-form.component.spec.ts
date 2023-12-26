import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAppointmentFormComponent } from './order-appointment-form.component';

describe('OrderAppointmentFormComponent', () => {
  let component: OrderAppointmentFormComponent;
  let fixture: ComponentFixture<OrderAppointmentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderAppointmentFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderAppointmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
