import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard'; // Ajusta la ruta según tu estructura

describe('authGuard', () => {
  let routerSpy: jest.Mocked<Router>;

  beforeEach(() => {
    routerSpy = { navigate: jest.fn() } as unknown as jest.Mocked<Router>;
    
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería retornar true si existe un token en localStorage', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('fake-jwt-token');

    const result = TestBed.runInInjectionContext(() => 
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('debería retornar false y redirigir a /login si no hay token', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    const result = TestBed.runInInjectionContext(() => 
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});