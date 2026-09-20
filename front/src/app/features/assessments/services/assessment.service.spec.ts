import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AssessmentService } from './assessment.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { environment } from '../../../../environments/environment';

describe('AssessmentService', () => {
  let service: AssessmentService;
  let httpMock: HttpTestingController;
  let authServiceMock: any;

  const baseApi = environment.apiUrl.replace(/\/$/, '');
  const apiUrl = `${baseApi}/assessments`;
  const evalUrl = `${baseApi}/evaluations`;

  beforeEach(() => {
    authServiceMock = {
      getRealUserId: jest.fn().mockReturnValue(1)
    };

    TestBed.configureTestingModule({
      providers: [
        AssessmentService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    service = TestBed.inject(AssessmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener todas las evaluaciones (getAllAssessments)', () => {
    const mockAssessments = [{ id: 1, title: 'Test 1' }];

    service.getAllAssessments().subscribe(res => {
      expect(res).toEqual(mockAssessments);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockAssessments);
  });

  it('debería obtener una evaluación por ID (getAssessmentById)', () => {
    const mockAssessment = { id: 1, title: 'Test 1' };

    service.getAssessmentById(1).subscribe(res => {
      expect(res).toEqual(mockAssessment);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAssessment);
  });

  it('debería obtener los intentos del usuario autenticado (getMyAttempts)', () => {
    const mockAttempts = [{ id: 1, score: 100 }];

    service.getMyAttempts().subscribe(res => {
      expect(res).toEqual(mockAttempts);
    });

    const req = httpMock.expectOne(`${evalUrl}/user/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAttempts);
  });

  it('debería iniciar una evaluación (startAssessment)', () => {
    const mockResponse = { attemptId: 10 };

    service.startAssessment(1, 2).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${evalUrl}/start?userId=1&assessmentId=2`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(mockResponse);
  });

  it('debería enviar una evaluación respondida (submitAssessment)', () => {
    const mockSubmissions = [{ questionId: 1, answer: 'A' }];
    const mockResponse = { result: 'success' };

    service.submitAssessment(5, mockSubmissions).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${evalUrl}/5/submit`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockSubmissions);
    req.flush(mockResponse);
  });

  it('debería obtener un intento por ID (getAttemptById)', () => {
    const mockAttempt = { id: 5, status: 'COMPLETED' };

    service.getAttemptById(5).subscribe(res => {
      expect(res).toEqual(mockAttempt);
    });

    const req = httpMock.expectOne(`${evalUrl}/attempt/5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAttempt);
  });

  it('debería obtener el podio por ID de evaluación (getPodiumByAssessmentId)', () => {
    const mockPodium = [{ rank: 1, username: 'user1' }];

    service.getPodiumByAssessmentId(3).subscribe(res => {
      expect(res).toEqual(mockPodium);
    });

    const req = httpMock.expectOne(`${evalUrl}/podium/3`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPodium);
  });
});