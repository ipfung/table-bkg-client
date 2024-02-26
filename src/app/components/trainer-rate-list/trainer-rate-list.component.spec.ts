import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerRateListComponent } from './trainer-rate-list.component';

describe('TrainerRateListComponent', () => {
  let component: TrainerRateListComponent;
  let fixture: ComponentFixture<TrainerRateListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainerRateListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainerRateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
