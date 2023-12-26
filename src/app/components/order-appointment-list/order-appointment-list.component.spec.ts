import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAppointmentListComponent } from './order-appointment-list.component';

describe('OrderAppointmentListComponent', () => {
  let component: OrderAppointmentListComponent;
  let fixture: ComponentFixture<OrderAppointmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderAppointmentListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderAppointmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
