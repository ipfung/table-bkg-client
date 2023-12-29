import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTrainerCommissionsComponent } from './report-trainer-commissions.component';

describe('ReportTrainerCommissionsComponent', () => {
  let component: ReportTrainerCommissionsComponent;
  let fixture: ComponentFixture<ReportTrainerCommissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportTrainerCommissionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportTrainerCommissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
