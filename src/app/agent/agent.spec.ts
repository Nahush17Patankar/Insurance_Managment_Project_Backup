import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Agent } from './agent';

describe('Agent', () => {
  let component: Agent;
  let fixture: ComponentFixture<Agent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Agent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Agent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
