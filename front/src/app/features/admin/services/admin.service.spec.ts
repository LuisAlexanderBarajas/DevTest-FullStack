import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminService } from './admin.service';
import { environment } from '../../../../environments/environment';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  const baseApi = environment.apiUrl.replace(/\/$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener todas las evaluaciones (getAllAssessments)', () => {
    const mockAssessments = [{ id: 1, title: 'Prueba Admin' }];

    service.getAllAssessments().subscribe(res => {
      expect(res).toEqual(mockAssessments);
    });

    const req = httpMock.expectOne(`${baseApi}/assessments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAssessments);
  });

  it('debería eliminar una evaluación (deleteAssessment)', () => {
    const mockResponse = { success: true };

    service.deleteAssessment(5).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseApi}/assessments/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('debería obtener el podio general (getPodium)', () => {
    const mockPodium = [{ rank: 1, candidate: 'Juan' }];

    service.getPodium().subscribe(res => {
      expect(res).toEqual(mockPodium);
    });

    const req = httpMock.expectOne(`${baseApi}/evaluations/podium`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPodium);
  });

  it('debería obtener el podio por ID de examen (getPodiumByAssessmentId)', () => {
    const mockPodium = [{ rank: 1, candidate: 'Ana' }];

    service.getPodiumByAssessmentId(2).subscribe(res => {
      expect(res).toEqual(mockPodium);
    });

    const req = httpMock.expectOne(`${baseApi}/evaluations/podium/2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPodium);
  });
});