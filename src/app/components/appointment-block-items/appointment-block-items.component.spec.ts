import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentBlockItemsComponent } from './appointment-block-items.component';

describe('AppointmentBlockItemsComponent', () => {
  let component: AppointmentBlockItemsComponent;
  let fixture: ComponentFixture<AppointmentBlockItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentBlockItemsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentBlockItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
