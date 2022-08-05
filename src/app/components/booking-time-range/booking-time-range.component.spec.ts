import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingTimeRangeComponent } from './booking-time-range.component';

describe('BookingTimeRangeComponent', () => {
  let component: BookingTimeRangeComponent;
  let fixture: ComponentFixture<BookingTimeRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingTimeRangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingTimeRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
