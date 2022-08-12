import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerStudentListComponent } from './trainer-student-list.component';

describe('TrainerStudentListComponent', () => {
  let component: TrainerStudentListComponent;
  let fixture: ComponentFixture<TrainerStudentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainerStudentListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainerStudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
