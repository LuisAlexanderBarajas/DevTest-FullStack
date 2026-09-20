import { TestBed } from '@angular/core/testing';
import { AssessmentManagementComponent } from './assessment-management.component';
import { AdminService } from '../../services/admin.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('AssessmentManagementComponent', () => {
  let component: AssessmentManagementComponent;
  let adminServiceMock: any;

  beforeEach(() => {
    adminServiceMock = {
      getAllAssessments: jest.fn().mockReturnValue(of([{ id: 1, title: 'Prueba 1' }])),
      deleteAssessment: jest.fn().mockReturnValue(of({ success: true }))
    };

    TestBed.configureTestingModule({
      imports: [AssessmentManagementComponent],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: ActivatedRoute, useValue: {} }
      ]
    });

    TestBed.runInInjectionContext(() => {
      component = new AssessmentManagementComponent();
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(Swal, 'fire').mockImplementation(() => Promise.resolve({ isConfirmed: true } as any));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit y loadAssessments', () => {
    it('debería cargar la lista de evaluaciones correctamente', () => {
      component.ngOnInit();

      expect(adminServiceMock.getAllAssessments).toHaveBeenCalled();
      expect(component.assessments()).toEqual([{ id: 1, title: 'Prueba 1' }]);
      expect(component.isLoading()).toBe(false);
    });

    it('debería manejar el error al cargar las evaluaciones', () => {
      adminServiceMock.getAllAssessments.mockReturnValue(throwError(() => new Error('Error')));

      component.loadAssessments();

      expect(component.isLoading()).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('deleteAssessment', () => {
    it('debería abrir el diálogo de confirmación y eliminar la evaluación si se confirma', async () => {
      await component.deleteAssessment(1, 'Prueba 1');

      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: '¿Eliminar evaluación?' }));
      expect(adminServiceMock.deleteAssessment).toHaveBeenCalledWith(1);
      expect(adminServiceMock.getAllAssessments).toHaveBeenCalled();
    });

    it('debería manejar el error si falla la eliminación', async () => {
      adminServiceMock.deleteAssessment.mockReturnValue(throwError(() => new Error('Error')));

      await component.deleteAssessment(1, 'Prueba 1');

      expect(adminServiceMock.deleteAssessment).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalled();
    });
  });
});