import { TestBed } from '@angular/core/testing';
import { AssessmentResultComponent } from './assessment-result.component';
import { AssessmentService } from '../../services/assessment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('AssessmentResultComponent', () => {
  let component: AssessmentResultComponent;
  let assessmentServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;
  let routeMock: any;

  beforeEach(() => {
    assessmentServiceMock = {
      getAttemptById: jest.fn().mockReturnValue(of({ id: 1, score: 90, status: 'COMPLETED' }))
    };

    authServiceMock = {
      getRealRole: jest.fn().mockReturnValue('ROLE_CANDIDATE')
    };

    routerMock = {
      navigate: jest.fn()
    };

    routeMock = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('123')
        }
      }
    };

    TestBed.configureTestingModule({
      imports: [AssessmentResultComponent],
      providers: [
        { provide: AssessmentService, useValue: assessmentServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock }
      ]
    });

    TestBed.runInInjectionContext(() => {
      component = new AssessmentResultComponent();
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit y fetchResults', () => {
    it('debería obtener el ID de los parámetros y cargar los resultados exitosamente', () => {
      component.ngOnInit();

      expect(component.attemptId).toBe('123');
      expect(assessmentServiceMock.getAttemptById).toHaveBeenCalledWith('123');
      expect(component.resultData).toEqual({ id: 1, score: 90, status: 'COMPLETED' });
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('no debería cargar resultados si no hay ID en la ruta', () => {
      routeMock.snapshot.paramMap.get.mockReturnValue(null);
      component.ngOnInit();

      expect(assessmentServiceMock.getAttemptById).not.toHaveBeenCalled();
    });

    it('debería manejar el error al cargar los resultados', () => {
      assessmentServiceMock.getAttemptById.mockReturnValue(throwError(() => new Error('Error')));

      component.fetchResults('123');

      expect(component.errorMessage).toBe('No se pudieron cargar los resultados de la evaluación.');
      expect(component.isLoading).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('goBack', () => {
    it('debería navegar a /admin/podium si el rol es ROLE_ADMIN', () => {
      authServiceMock.getRealRole.mockReturnValue('ROLE_ADMIN');
      component.goBack();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/podium']);
    });

    it('debería navegar a /admin/podium si el rol es ADMIN', () => {
      authServiceMock.getRealRole.mockReturnValue('ADMIN');
      component.goBack();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/podium']);
    });

    it('debería navegar a candidate/assessments si el rol no es administrador', () => {
      authServiceMock.getRealRole.mockReturnValue('CANDIDATE');
      component.goBack();

      expect(routerMock.navigate).toHaveBeenCalledWith(['candidate/assessments']);
    });
  });
});