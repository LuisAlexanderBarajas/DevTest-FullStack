import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { candidateGuard } from './candidate.guard'; // Ajusta la ruta
import { AuthService } from '../../features/auth/services/auth.service';

describe('candidateGuard', () => {
  let routerSpy: jest.Mocked<Router>;
  let authServiceSpy: jest.Mocked<AuthService>;

  beforeEach(() => {
    routerSpy = { navigate: jest.fn() } as unknown as jest.Mocked<Router>;
    authServiceSpy = { getRealRole: jest.fn() } as unknown as jest.Mocked<AuthService>;
    
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    jest.spyOn(Storage.prototype, 'clear').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería limpiar localStorage, redirigir a /login y retornar false si no hay rol', () => {
    authServiceSpy.getRealRole.mockReturnValue(null);

    const result = TestBed.runInInjectionContext(() => 
      candidateGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(localStorage.clear).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(false);
  });

  it('debería retornar true si el rol es ROLE_CANDIDATE', () => {
    authServiceSpy.getRealRole.mockReturnValue('ROLE_CANDIDATE');

    const result = TestBed.runInInjectionContext(() => 
      candidateGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('debería retornar true si el rol es CANDIDATE', () => {
    authServiceSpy.getRealRole.mockReturnValue('CANDIDATE');

    const result = TestBed.runInInjectionContext(() => 
      candidateGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
  });

  it('debería redirigir a /dashboard y retornar false si tiene otro rol', () => {
    authServiceSpy.getRealRole.mockReturnValue('ROLE_ADMIN');

    const result = TestBed.runInInjectionContext(() => 
      candidateGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});