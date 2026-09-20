import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentCreateComponent } from './assessment-create.component';

describe('AssessmentCreateComponent', () => {
  let component: AssessmentCreateComponent;
  let fixture: ComponentFixture<AssessmentCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
