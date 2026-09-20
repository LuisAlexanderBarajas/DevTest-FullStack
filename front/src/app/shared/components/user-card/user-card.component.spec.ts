import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserCardComponent } from './user-card.component';
import { AuthService } from '../../../features/auth/services/auth.service';

describe('UserCardComponent', () => {
  let component: UserCardComponent;
  let fixture: ComponentFixture<UserCardComponent>;
  let authServiceSpy: jest.Mocked<AuthService>;

  beforeEach(async () => {
    authServiceSpy = {
      getRealUsername: jest.fn(),
      getRealRole: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    await TestBed.configureTestingModule({
      imports: [UserCardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserCardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería asignar el username y el role correctos desde el AuthService', () => {
      authServiceSpy.getRealUsername.mockReturnValue('Alejandro');
      authServiceSpy.getRealRole.mockReturnValue('ROLE_ADMIN');

      fixture.detectChanges();

      expect(component.username).toBe('Alejandro');
      expect(component.role).toBe('ROLE_ADMIN');
    });

    it('debería asignar "Usuario" como valor por defecto si no hay username', () => {
      authServiceSpy.getRealUsername.mockReturnValue(null as any);
      authServiceSpy.getRealRole.mockReturnValue('ROLE_CANDIDATE');

      fixture.detectChanges();

      expect(component.username).toBe('Usuario');
      expect(component.role).toBe('ROLE_CANDIDATE');
    });
  });

  describe('isRoleAdmin', () => {
    it('debería devolver true cuando el rol cargado es ROLE_ADMIN', () => {
      authServiceSpy.getRealRole.mockReturnValue('ROLE_ADMIN');
      fixture.detectChanges();

      expect(component.isRoleAdmin).toBe(true);
    });

    it('debería devolver false cuando el rol cargado es diferente a ROLE_ADMIN', () => {
      authServiceSpy.getRealRole.mockReturnValue('CANDIDATE');
      fixture.detectChanges();

      expect(component.isRoleAdmin).toBe(false);
    });
  });
});