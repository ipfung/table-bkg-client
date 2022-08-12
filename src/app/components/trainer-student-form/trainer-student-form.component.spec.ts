import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerStudentFormComponent } from './trainer-student-form.component';

describe('TrainerStudentFormComponent', () => {
  let component: TrainerStudentFormComponent;
  let fixture: ComponentFixture<TrainerStudentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainerStudentFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainerStudentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
