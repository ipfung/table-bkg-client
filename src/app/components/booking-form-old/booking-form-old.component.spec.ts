import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingFormOldComponent } from './booking-form-old.component';

describe('BookingFormOldComponent', () => {
  let component: BookingFormOldComponent;
  let fixture: ComponentFixture<BookingFormOldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingFormOldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingFormOldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
