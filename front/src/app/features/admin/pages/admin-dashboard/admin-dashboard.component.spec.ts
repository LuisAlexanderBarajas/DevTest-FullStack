import { TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminService } from '../../services/admin.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let adminServiceMock: any;

  beforeEach(() => {
    adminServiceMock = {
      getAllAssessments: jest.fn().mockReturnValue(of([{ id: 1, title: 'Test' }])),
      getPodium: jest.fn().mockReturnValue(of([{ rank: 1, candidate: 'Luis' }])),
      deleteAssessment: jest.fn().mockReturnValue(of({ success: true }))
    };

    TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: ActivatedRoute, useValue: {} }
      ]
    });

    TestBed.runInInjectionContext(() => {
      component = new AdminDashboardComponent();
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

  describe('ngOnInit y loadAdminData', () => {
    it('debería cargar las evaluaciones y el podio correctamente', () => {
      component.ngOnInit();

      expect(adminServiceMock.getAllAssessments).toHaveBeenCalled();
      expect(adminServiceMock.getPodium).toHaveBeenCalled();
      expect(component.assessments()).toEqual([{ id: 1, title: 'Test' }]);
      expect(component.podiumList()).toEqual([{ rank: 1, candidate: 'Luis' }]);
      expect(component.isLoading()).toBe(false);
    });

    it('debería manejar el error al cargar evaluaciones', () => {
      adminServiceMock.getAllAssessments.mockReturnValue(throwError(() => new Error('Error')));

      component.loadAdminData();

      expect(console.error).toHaveBeenCalled();
    });

    it('debería manejar el error al cargar el podio y establecer isLoading en false', () => {
      adminServiceMock.getPodium.mockReturnValue(throwError(() => new Error('Error')));

      component.loadAdminData();

      expect(component.isLoading()).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('deleteAssessment', () => {
    it('debería confirmar y eliminar la evaluación recargando los datos', async () => {
      await component.deleteAssessment(1, 'Test');

      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: '¿Eliminar evaluación?' }));
      expect(adminServiceMock.deleteAssessment).toHaveBeenCalledWith(1);
      expect(adminServiceMock.getAllAssessments).toHaveBeenCalled();
    });

    it('debería manejar el error si falla la eliminación', async () => {
      adminServiceMock.deleteAssessment.mockReturnValue(throwError(() => new Error('Error')));

      await component.deleteAssessment(1, 'Test');

      expect(adminServiceMock.deleteAssessment).toHaveBeenCalledWith(1);
      expect(console.error).toHaveBeenCalled();
    });
  });
});