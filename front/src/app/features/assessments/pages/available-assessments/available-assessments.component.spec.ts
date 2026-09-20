import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableAssessmentsComponent } from './available-assessments.component';

describe('AvailableAssessmentsComponent', () => {
  let component: AvailableAssessmentsComponent;
  let fixture: ComponentFixture<AvailableAssessmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableAssessmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailableAssessmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
