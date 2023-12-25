import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentBlocksComponent } from './appointment-blocks.component';

describe('AppointmentBlocksComponent', () => {
  let component: AppointmentBlocksComponent;
  let fixture: ComponentFixture<AppointmentBlocksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentBlocksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentBlocksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
