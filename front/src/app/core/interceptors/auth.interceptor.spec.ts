import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpRequest, HttpErrorResponse, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor'; 

describe('authInterceptor', () => {
  let routerSpy: jest.Mocked<Router>;

  beforeEach(() => {
    routerSpy = { navigate: jest.fn() } as unknown as jest.Mocked<Router>;
    
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });

    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    jest.spyOn(Storage.prototype, 'clear').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería agregar el encabezado Authorization si hay token en localStorage', (done) => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-jwt-token');
    const req = new HttpRequest('GET', '/api/data');
    const next: HttpHandlerFn = jest.fn().mockReturnValue(of({} as HttpEvent<unknown>));

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe(() => {
        expect(next).toHaveBeenCalled();
        const clonedReq = (next as jest.Mock).mock.calls[0][0] as HttpRequest<unknown>;
        expect(clonedReq.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
        done();
      });
    });
  });

  it('no debería modificar la petición si no hay token', (done) => {
    const req = new HttpRequest('GET', '/api/data');
    const next: HttpHandlerFn = jest.fn().mockReturnValue(of({} as HttpEvent<unknown>));

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe(() => {
        expect(next).toHaveBeenCalledWith(req);
        done();
      });
    });
  });

  it('debería limpiar localStorage y redirigir a /login si hay un error 401', (done) => {
    const req = new HttpRequest('GET', '/api/data');
    const errorResponse = new HttpErrorResponse({ status: 401 });
    const next: HttpHandlerFn = jest.fn().mockReturnValue(throwError(() => errorResponse));

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        error: (err) => {
          expect(console.warn).toHaveBeenCalledWith('Brecha de seguridad detectada. Limpiando sesión...');
          expect(localStorage.clear).toHaveBeenCalled();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          expect(err).toBe(errorResponse);
          done();
        }
      });
    });
  });

  it('debería limpiar localStorage y redirigir a /login si hay un error 403', (done) => {
    const req = new HttpRequest('GET', '/api/data');
    const errorResponse = new HttpErrorResponse({ status: 403 });
    const next: HttpHandlerFn = jest.fn().mockReturnValue(throwError(() => errorResponse));

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        error: (err) => {
          expect(localStorage.clear).toHaveBeenCalled();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          expect(err).toBe(errorResponse);
          done();
        }
      });
    });
  });

  it('no debería afectar localStorage ni redirigir en otros errores (ej. 500)', (done) => {
    const req = new HttpRequest('GET', '/api/data');
    const errorResponse = new HttpErrorResponse({ status: 500 });
    const next: HttpHandlerFn = jest.fn().mockReturnValue(throwError(() => errorResponse));

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next).subscribe({
        error: (err) => {
          expect(console.warn).not.toHaveBeenCalled();
          expect(localStorage.clear).not.toHaveBeenCalled();
          expect(routerSpy.navigate).not.toHaveBeenCalled();
          expect(err).toBe(errorResponse);
          done();
        }
      });
    });
  });
});