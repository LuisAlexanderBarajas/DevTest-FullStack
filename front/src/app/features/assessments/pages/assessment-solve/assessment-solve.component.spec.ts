import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentSolveComponent } from './assessment-solve.component';

describe('AssessmentSolveComponent', () => {
  let component: AssessmentSolveComponent;
  let fixture: ComponentFixture<AssessmentSolveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentSolveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentSolveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
