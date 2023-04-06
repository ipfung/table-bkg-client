import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassCheckinComponent } from './class-checkin.component';

describe('ClassCheckinComponent', () => {
  let component: ClassCheckinComponent;
  let fixture: ComponentFixture<ClassCheckinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassCheckinComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassCheckinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
