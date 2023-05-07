import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReschedulePackageComponent } from './reschedule-package.component';

describe('ReschedulePackageComponent', () => {
  let component: ReschedulePackageComponent;
  let fixture: ComponentFixture<ReschedulePackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReschedulePackageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReschedulePackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
