import { TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ActivatedRoute } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    });

    TestBed.runInInjectionContext(() => {
      component = new DashboardComponent();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });
});