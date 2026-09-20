import { TestBed } from '@angular/core/testing';
import { PodiumComponent } from './podium.component';
import { AdminService } from '../../services/admin.service';
import { of, throwError } from 'rxjs';

describe('PodiumComponent', () => {
  let component: PodiumComponent;
  let adminServiceMock: any;

  beforeEach(() => {
    adminServiceMock = {
      getAllAssessments: jest.fn().mockReturnValue(of([{ id: 1, title: 'Prueba 1' }])),
      getPodiumByAssessmentId: jest.fn().mockReturnValue(of([{ rank: 1, candidate: 'Luis' }]))
    };

    TestBed.configureTestingModule({
      imports: [PodiumComponent],
      providers: [
        { provide: AdminService, useValue: adminServiceMock }
      ]
    });

    TestBed.runInInjectionContext(() => {
      component = new PodiumComponent();
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit y loadAssessments', () => {
    it('debería cargar las evaluaciones, seleccionar la primera y cargar su podio', () => {
      component.ngOnInit();

      expect(adminServiceMock.getAllAssessments).toHaveBeenCalled();
      expect(component.assessments()).toEqual([{ id: 1, title: 'Prueba 1' }]);
      expect(component.selectedAssessmentId()).toBe(1);
      expect(adminServiceMock.getPodiumByAssessmentId).toHaveBeenCalledWith(1);
      expect(component.podiumList()).toEqual([{ rank: 1, candidate: 'Luis' }]);
      expect(component.isLoading()).toBe(false);
    });

    it('debería establecer isLoading en false si no hay evaluaciones', () => {
      adminServiceMock.getAllAssessments.mockReturnValue(of([]));

      component.loadAssessments();

      expect(component.assessments()).toEqual([]);
      expect(component.isLoading()).toBe(false);
    });

    it('debería manejar el error al cargar las evaluaciones', () => {
      adminServiceMock.getAllAssessments.mockReturnValue(throwError(() => new Error('Error')));

      component.loadAssessments();

      expect(component.isLoading()).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('onAssessmentChange', () => {
    it('debería cambiar el ID seleccionado y cargar el nuevo podio', () => {
      const mockEvent = {
        target: { value: '2' }
      } as unknown as Event;

      component.onAssessmentChange(mockEvent);

      expect(component.selectedAssessmentId()).toBe(2);
      expect(adminServiceMock.getPodiumByAssessmentId).toHaveBeenCalledWith(2);
    });
  });

  describe('loadPodium', () => {
    it('debería actualizar la lista del podio exitosamente', () => {
      const mockPodium = [{ rank: 1, candidate: 'Ana' }];
      adminServiceMock.getPodiumByAssessmentId.mockReturnValue(of(mockPodium));

      component.loadPodium(5);

      expect(component.podiumList()).toEqual(mockPodium);
      expect(component.isLoading()).toBe(false);
    });

    it('debería manejar el error al cargar el podio', () => {
      adminServiceMock.getPodiumByAssessmentId.mockReturnValue(throwError(() => new Error('Error')));

      component.loadPodium(5);

      expect(component.isLoading()).toBe(false);
      expect(console.error).toHaveBeenCalled();
    });
  });
});