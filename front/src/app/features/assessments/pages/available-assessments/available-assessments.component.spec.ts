import { TestBed } from '@angular/core/testing';
import { AvailableAssessmentsComponent } from './available-assessments.component';
import { AssessmentService } from '../../services/assessment.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('AvailableAssessmentsComponent', () => {
  let component: AvailableAssessmentsComponent;
  let assessmentServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    assessmentServiceMock = {
      getAllAssessments: jest.fn().mockReturnValue(of([{ id: 1, title: 'Test 1' }])),
      getMyAttempts: jest.fn().mockReturnValue(of([{ id: 10, status: 'COMPLETED', assessment: { id: 1 } }])),
      startAssessment: jest.fn().mockReturnValue(of({ id: 100 }))
    };

    authServiceMock = {
      getRealUserId: jest.fn().mockReturnValue(1)
    };

    routerMock = {
      navigate: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [AvailableAssessmentsComponent],
      providers: [
        { provide: AssessmentService, useValue: assessmentServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    TestBed.runInInjectionContext(() => {
      component = new AvailableAssessmentsComponent();
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({} as any));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit y loadData', () => {
    it('debería cargar evaluaciones y enriquecerlas con los intentos del usuario', () => {
      component.ngOnInit();

      expect(assessmentServiceMock.getAllAssessments).toHaveBeenCalled();
      expect(assessmentServiceMock.getMyAttempts).toHaveBeenCalled();
      expect(component.assessments()).toEqual([
        { id: 1, title: 'Test 1', status: 'COMPLETED', attemptId: 10 }
      ]);
      expect(component.isLoading()).toBe(false);
    });

    it('debería manejar el error de getMyAttempts estableciendo solo las evaluaciones base', () => {
      assessmentServiceMock.getMyAttempts.mockReturnValue(throwError(() => new Error('Error')));

      component.loadData();

      expect(component.assessments()).toEqual([{ id: 1, title: 'Test 1' }]);
      expect(component.isLoading()).toBe(false);
    });

    it('debería detener la carga si getAllAssessments falla', () => {
      assessmentServiceMock.getAllAssessments.mockReturnValue(throwError(() => new Error('Error')));

      component.loadData();

      expect(component.isLoading()).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('handleAssessmentAction', () => {
    it('debería navegar a los resultados si el status es COMPLETED', () => {
      const assessment = { id: 1, status: 'COMPLETED', attemptId: 10 };

      component.handleAssessmentAction(assessment);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/assessment/result/10']);
    });

    it('debería navegar a la evaluación si el status es IN_PROGRESS', () => {
      const assessment = { id: 1, status: 'IN_PROGRESS', attemptId: 20 };

      component.handleAssessmentAction(assessment);

      expect(routerMock.navigate).toHaveBeenCalledWith(['/assessment/20']);
    });

    it('debería iniciar una nueva evaluación si no tiene estado previo y navegar al intento creado', () => {
      const assessment = { id: 1, status: 'NOT_STARTED' };

      component.handleAssessmentAction(assessment);

      expect(authServiceMock.getRealUserId).toHaveBeenCalled();
      expect(assessmentServiceMock.startAssessment).toHaveBeenCalledWith(1, 1);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/assessment/100']);
    });

    it('no debería iniciar evaluación si no hay userId', () => {
      authServiceMock.getRealUserId.mockReturnValue(null);
      const assessment = { id: 1, status: 'NOT_STARTED' };

      component.handleAssessmentAction(assessment);

      expect(assessmentServiceMock.startAssessment).not.toHaveBeenCalled();
    });

    it('debería mostrar alerta de error si falla al iniciar la evaluación', () => {
      assessmentServiceMock.startAssessment.mockReturnValue(throwError(() => new Error('Error')));
      const assessment = { id: 1, status: 'NOT_STARTED' };

      component.handleAssessmentAction(assessment);

      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' }));
    });
  });
});