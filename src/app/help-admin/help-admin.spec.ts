import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpAdmin } from './help-admin';

describe('HelpAdmin', () => {
  let component: HelpAdmin;
  let fixture: ComponentFixture<HelpAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
