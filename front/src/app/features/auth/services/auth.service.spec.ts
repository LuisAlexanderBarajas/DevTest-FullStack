import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'clear').mockImplementation(() => {});
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
  });

  afterEach(() => {
    httpMock.verify();
    jest.restoreAllMocks();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('debería hacer POST y guardar el token en localStorage', () => {
      const mockCredentials = { username: 'test', password: '123' };
      const mockResponse = { token: 'fake-token' };

      service.login(mockCredentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCredentials);
      req.flush(mockResponse);

      expect(localStorage.clear).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userRole');
      expect(localStorage.removeItem).toHaveBeenCalledWith('username');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userId');
    });
  });

  describe('register', () => {
    it('debería hacer POST para registrar un usuario', () => {
      const mockUserData = { username: 'test', password: '123' };
      const mockResponse = { message: 'Success' };

      service.register(mockUserData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockUserData);
      req.flush(mockResponse);
    });
  });

  describe('Decodificación de Token', () => {
    const mockPayload = { sub: 'luis', role: 'ROLE_ADMIN', userId: 10 };
    const base64Payload = btoa(JSON.stringify(mockPayload));
    const fakeJwt = `header.${base64Payload}.signature`;

    it('debería retornar el rol correctamente si el token es válido', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(fakeJwt);
      expect(service.getRealRole()).toBe('ROLE_ADMIN');
    });

    it('debería retornar el userId correctamente si el token es válido', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(fakeJwt);
      expect(service.getRealUserId()).toBe(10);
    });

    it('debería retornar el username correctamente si el token es válido', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(fakeJwt);
      expect(service.getRealUsername()).toBe('luis');
    });

    it('debería retornar null si no hay token', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      expect(service.getRealRole()).toBeNull();
      expect(service.getRealUserId()).toBeNull();
      expect(service.getRealUsername()).toBeNull();
    });

    it('debería retornar null si el token es inválido', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid.token.structure');
      expect(service.getRealRole()).toBeNull();
    });
  });
});