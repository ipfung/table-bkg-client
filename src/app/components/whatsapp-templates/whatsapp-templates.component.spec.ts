import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsappTemplatesComponent } from './whatsapp-templates.component';

describe('WhatsappTemplatesComponent', () => {
  let component: WhatsappTemplatesComponent;
  let fixture: ComponentFixture<WhatsappTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhatsappTemplatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatsappTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
