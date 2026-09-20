import { TestBed } from '@angular/core/testing';
import { AssessmentSolveComponent } from './assessment-solve.component';
import { AssessmentService } from '../../services/assessment.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('AssessmentSolveComponent', () => {
  let component: AssessmentSolveComponent;
  let assessmentServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;
  let routeMock: any;
  let httpClientMock: any;

  beforeEach(() => {
    assessmentServiceMock = {
      getAttemptById: jest.fn().mockReturnValue(of({
        startedAt: new Date().toISOString(),
        assessment: {
          timeLimitMinutes: 30,
          questions: [{ id: 1, title: 'Pregunta 1' }]
        }
      })),
      startAssessment: jest.fn().mockReturnValue(of({ id: 50 })),
      submitAssessment: jest.fn().mockReturnValue(of({ success: true }))
    };

    authServiceMock = {
      getRealUserId: jest.fn().mockReturnValue(1)
    };

    routerMock = {
      navigate: jest.fn()
    };

    routeMock = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('10')
        }
      }
    };

    httpClientMock = {
      post: jest.fn().mockReturnValue(of({ consoleOutput: 'Exitoso', passedCases: 2 }))
    };

    TestBed.configureTestingModule({
      imports: [AssessmentSolveComponent],
      providers: [
        { provide: AssessmentService, useValue: assessmentServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: HttpClient, useValue: httpClientMock }
      ]
    });

    TestBed.runInInjectionContext(() => {
      component = new AssessmentSolveComponent();
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({ isConfirmed: true } as any));
    jest.spyOn(Swal, 'showLoading').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    if (component['timerInterval']) {
      clearInterval(component['timerInterval']);
    }
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit y loadAttemptDetails', () => {
    it('debería cargar los detalles del intento y configurar el temporizador', () => {
      component.ngOnInit();

      expect(component.attemptId).toBe(10);
      expect(assessmentServiceMock.getAttemptById).toHaveBeenCalledWith(10);
      expect(component.questions.length).toBe(1);
      expect(component.timeRemaining()).toBeGreaterThan(0);
    });

    it('no debería cargar detalles si no hay attemptId', () => {
      routeMock.snapshot.paramMap.get.mockReturnValue(null);
      component.ngOnInit();

      expect(assessmentServiceMock.getAttemptById).not.toHaveBeenCalled();
    });

    it('debería disparar autoSubmit si el tiempo ya expiró', () => {
      const pastDate = new Date(new Date().getTime() - 40 * 60 * 1000).toISOString();
      assessmentServiceMock.getAttemptById.mockReturnValue(of({
        startedAt: pastDate,
        assessment: { timeLimitMinutes: 30, questions: [{ id: 1 }] }
      }));

      component.ngOnInit();

      expect(component.timeRemaining()).toBe(0);
      expect(Swal.fire).toHaveBeenCalled();
    });
  });

  describe('startAttempt', () => {
    it('debería iniciar un intento si se obtiene el ID real del usuario', () => {
      component.assessmentId = 5;
      component.startAttempt();

      expect(authServiceMock.getRealUserId).toHaveBeenCalled();
      expect(assessmentServiceMock.startAssessment).toHaveBeenCalledWith(1, 5);
      expect(component.attemptId).toBe(50);
    });

    it('no debería iniciar intento si no hay userId', () => {
      authServiceMock.getRealUserId.mockReturnValue(null);
      component.startAttempt();

      expect(assessmentServiceMock.startAssessment).not.toHaveBeenCalled();
    });
  });

  describe('Navegación de Preguntas y Lenguaje', () => {
    it('debería cambiar de pregunta guardando borrador y actualizar el código', () => {
      component.questions = [{ id: 1 }, { id: 2 }];
      component.currentIndex.set(0);
      component.code = 'console.log("test")';

      component.changeQuestion(1);

      expect(component.codeDrafts.get(1)).toBe('console.log("test")');
      expect(component.currentIndex()).toBe(1);
    });

    it('debería cambiar el lenguaje y actualizar el snippet del editor', () => {
      const event = { target: { value: 'python' } };
      component.onLanguageChange(event);

      expect(component.selectedLanguage()).toBe('python');
      expect(component.code).toContain('def solve():');
    });
  });

  describe('Ejecución de Código (executeCode)', () => {
    it('no debería ejecutar si el código está vacío o no hay preguntas', () => {
      component.code = '   ';
      component.executeCode();

      expect(httpClientMock.post).not.toHaveBeenCalled();
    });

    it('debería enviar el código al backend y actualizar el historial de casos pasados', () => {
      component.questions = [{ id: 1 }];
      component.code = 'int x = 0;';
      component.selectedLanguage.set('java');

      component.executeCode();

      expect(httpClientMock.post).toHaveBeenCalled();
      expect(component.consoleOutput()).toBe('Exitoso');
      expect(component.passedTestsDrafts.get(1)).toBe(2);
    });

    it('debería manejar el error de ejecución de código', () => {
      httpClientMock.post.mockReturnValue(throwError(() => ({ message: 'Network error' })));
      component.questions = [{ id: 1 }];
      component.code = 'error code';

      component.executeCode();

      expect(component.consoleOutput()).toContain('[ERROR DEL SERVIDOR]');
    });
  });

  describe('Envío de Evaluación (submitAssessment / executeSubmit)', () => {
    it('debería abrir confirmación al llamar a submitAssessment', () => {
      component.submitAssessment();
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: '¿Terminar y enviar?' }));
    });

    it('debería enviar la evaluación exitosamente y redirigir', async () => {
      component.attemptId = 10;
      component.questions = [{ id: 1 }];
      
      await (component as any).executeSubmit();

      expect(assessmentServiceMock.submitAssessment).toHaveBeenCalledWith(10, expect.any(Array));
      expect(routerMock.navigate).toHaveBeenCalledWith(['/assessment/result/10']);
    });

    it('debería mostrar alerta de error si falla al enviar la prueba', async () => {
      assessmentServiceMock.submitAssessment.mockReturnValue(throwError(() => new Error('Error')));
      component.attemptId = 10;
      component.questions = [{ id: 1 }];

      await (component as any).executeSubmit();

      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Error' }));
    });
  });
});