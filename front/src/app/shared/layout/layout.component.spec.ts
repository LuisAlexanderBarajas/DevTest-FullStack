import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutComponent } from './layout.component';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../features/auth/services/auth.service'; 
import { Subject } from 'rxjs';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  let locationSpy: jest.Mocked<Location>;
  let authServiceSpy: jest.Mocked<AuthService>;
  let routerEventsSubject: Subject<any>;
  let routerSpy: any;

  beforeEach(async () => {
    routerEventsSubject = new Subject<any>();
    
    routerSpy = {
      url: '/dashboard',
      events: routerEventsSubject.asObservable(),
      navigate: jest.fn(),
      createUrlTree: jest.fn().mockReturnValue({}),
      serializeUrl: jest.fn().mockReturnValue('')
    };

    locationSpy = { back: jest.fn() } as unknown as jest.Mocked<Location>;

    authServiceSpy = {
      getRealRole: jest.fn(),
      getRealUsername: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: Location, useValue: locationSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: {} } // Necesario para RouterOutlet y RouterLink
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    
    jest.spyOn(Storage.prototype, 'clear').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería inicializar el componente y suscribirse a eventos', () => {
    fixture.detectChanges(); 
    expect(component).toBeTruthy();
    expect(component.pageTitle()).toBe('Panel de Control');
  });

  describe('updateTopbar', () => {
    it('debería asignar Configuración de Evaluación y mostrar botón atrás', () => {
      routerSpy.url = '/assessment/create';
      fixture.detectChanges(); 
      expect(component.pageTitle()).toBe('Configuración de Evaluación');
      expect(component.showBackButton()).toBe(true);
    });

    it('debería actualizar el título mediante NavigationEnd para Gestionar Evaluaciones', () => {
      fixture.detectChanges();
      routerEventsSubject.next(new NavigationEnd(1, '/admin/management', '/admin/management'));
      expect(component.pageTitle()).toBe('Gestionar Evaluaciones');
      expect(component.showBackButton()).toBe(false);
    });

    it('debería asignar Podio y Resultados mediante NavigationEnd', () => {
      fixture.detectChanges();
      routerEventsSubject.next(new NavigationEnd(1, '/admin/podium', '/admin/podium'));
      expect(component.pageTitle()).toBe('Podio y Resultados');
    });

    it('debería asignar Resultados de la Prueba mediante NavigationEnd', () => {
      fixture.detectChanges();
      routerEventsSubject.next(new NavigationEnd(1, '/assessment/result', '/assessment/result'));
      expect(component.pageTitle()).toBe('Resultados de la Prueba');
    });
  });

  describe('Navegación y Autenticación', () => {
    it('debería llamar a location.back() al ejecutar goBack()', () => {
      component.goBack();
      expect(locationSpy.back).toHaveBeenCalled();
    });

    it('debería retornar true en isAdmin si el rol es ROLE_ADMIN', () => {
      authServiceSpy.getRealRole.mockReturnValue('ROLE_ADMIN');
      expect(component.isAdmin).toBe(true);
    });

    it('debería retornar false en isAdmin si el rol no es ROLE_ADMIN', () => {
      authServiceSpy.getRealRole.mockReturnValue('CANDIDATE');
      expect(component.isAdmin).toBe(false);
    });

    it('debería limpiar localStorage y navegar a /login al ejecutar logout()', () => {
      component.logout();
      expect(localStorage.clear).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Información del usuario', () => {
    it('debería devolver el username y su inicial si existe', () => {
      authServiceSpy.getRealUsername.mockReturnValue('Luis');
      expect(component.currentUsername).toBe('Luis');
      expect(component.userInitial).toBe('L');
    });

    it('debería devolver Usuario y U si no hay username', () => {
      authServiceSpy.getRealUsername.mockReturnValue(null as any);
      expect(component.currentUsername).toBe('Usuario');
      expect(component.userInitial).toBe('U');
    });
  });

  it('debería desuscribirse de router.events al destruir el componente', () => {
    fixture.detectChanges();
    const subSpy = jest.spyOn(component['routerSub'], 'unsubscribe');
    component.ngOnDestroy();
    expect(subSpy).toHaveBeenCalled();
  });
});