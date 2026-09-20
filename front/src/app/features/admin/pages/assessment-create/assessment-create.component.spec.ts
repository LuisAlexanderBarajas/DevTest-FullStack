import { TestBed } from '@angular/core/testing';
import { AssessmentCreateComponent } from './assessment-create.component';
import { AssessmentFormService } from './assessment-form.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('AssessmentCreateComponent', () => {
  let component: AssessmentCreateComponent;
  let formServiceMock: any;
  let httpClientMock: any;
  let routerMock: any;
  let routeMock: any;

  beforeEach(() => {
    formServiceMock = {
      resetForm: jest.fn(),
      addQuestion: jest.fn(),
      patchForm: jest.fn(),
      form: {
        invalid: false,
        markAllAsTouched: jest.fn(),
        value: {
          title: 'Test',
          questions: [{ testCases: [{ inputData: ' 1 ', expectedOutput: ' 2 ' }] }]
        }
      },
      questions: [1]
    };

    httpClientMock = {
      get: jest.fn().mockReturnValue(of({ id: 1, title: 'Test' })),
      post: jest.fn().mockReturnValue(of({ success: true })),
      put: jest.fn().mockReturnValue(of({ success: true }))
    };

    routerMock = {
      navigate: jest.fn()
    };

    routeMock = {
      paramMap: of({
        get: jest.fn().mockReturnValue('1')
      })
    };

    TestBed.configureTestingModule({
      imports: [AssessmentCreateComponent],
      providers: [
        { provide: AssessmentFormService, useValue: formServiceMock },
        { provide: HttpClient, useValue: httpClientMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock }
      ]
    });

    TestBed.runInInjectionContext(() => {
      component = new AssessmentCreateComponent();
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

  describe('ngOnInit y loadAssessmentData', () => {
    it('debería configurar modo edición y cargar datos si existe ID en la ruta', () => {
      component.ngOnInit();

      expect(formServiceMock.resetForm).toHaveBeenCalled();
      expect(component.isEditMode()).toBe(true);
      expect(component.assessmentId()).toBe(1);
      expect(httpClientMock.get).toHaveBeenCalled();
      expect(formServiceMock.patchForm).toHaveBeenCalled();
    });

    it('debería configurar modo creación y agregar pregunta si no hay ID en la ruta', () => {
      routeMock.paramMap = of({ get: jest.fn().mockReturnValue(null) });

      component.ngOnInit();

      expect(component.isEditMode()).toBe(false);
      expect(formServiceMock.addQuestion).toHaveBeenCalled();
    });

    it('debería manejar error al cargar evaluación y redirigir', async () => {
      httpClientMock.get.mockReturnValue(throwError(() => new Error('Error')));

      component.loadAssessmentData(1);

      expect(console.error).toHaveBeenCalled();
      expect(Swal.fire).toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    it('no debería enviar si el formulario es inválido o no tiene preguntas', () => {
      formServiceMock.form.invalid = true;

      component.onSubmit();

      expect(formServiceMock.form.markAllAsTouched).toHaveBeenCalled();
      expect(httpClientMock.post).not.toHaveBeenCalled();
    });

    it('debería realizar petición POST si está en modo creación', async () => {
      component.isEditMode.set(false);

      await component.onSubmit();

      expect(httpClientMock.post).toHaveBeenCalled();
      expect(component.isSubmitting()).toBe(true);
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success' }));
    });

    it('debería realizar petición PUT si está en modo edición', async () => {
      component.isEditMode.set(true);
      component.assessmentId.set(1);

      await component.onSubmit();

      expect(httpClientMock.put).toHaveBeenCalled();
    });

    it('debería manejar error si falla la petición de guardado', async () => {
      httpClientMock.post.mockReturnValue(throwError(() => new Error('Error')));

      await component.onSubmit();

      expect(component.isSubmitting()).toBe(false);
      expect(Swal.fire).toHaveBeenCalledWith('Error', 'Ocurrió un error al guardar la evaluación.', 'error');
    });
  });
});