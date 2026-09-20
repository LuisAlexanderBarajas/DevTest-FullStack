import { TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    authServiceMock = {
      login: jest.fn().mockReturnValue(of({ token: 'fake-token', role: 'ROLE_ADMIN' }))
    };

    routerMock = {
      navigate: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    // Creamos la instancia dentro del contexto de inyección de Angular
    TestBed.runInInjectionContext(() => {
      component = new LoginComponent();
    });

    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('Validaciones del Formulario', () => {
    it('debería marcar el formulario como inválido si está vacío', () => {
      expect(component.loginForm.valid).toBe(false);
    });

    it('debería validar username y password requeridos', () => {
      const usernameControl = component.loginForm.controls['username'];
      const passwordControl = component.loginForm.controls['password'];

      usernameControl.setValue('');
      passwordControl.setValue('');
      expect(usernameControl.hasError('required')).toBe(true);
      expect(passwordControl.hasError('required')).toBe(true);

      usernameControl.setValue('admin');
      passwordControl.setValue('123456');
      expect(component.loginForm.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('debería marcar campos como tocados si el formulario es inválido', () => {
      const markAllSpy = jest.spyOn(component.loginForm, 'markAllAsTouched');
      
      component.onSubmit();

      expect(markAllSpy).toHaveBeenCalled();
      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('debería iniciar sesión y redirigir a /dashboard si el rol es ROLE_ADMIN', () => {
      authServiceMock.login.mockReturnValue(of({ token: 'token-admin', role: 'ROLE_ADMIN' }));

      component.loginForm.setValue({
        username: 'admin',
        password: 'Password123'
      });

      component.onSubmit();

      expect(authServiceMock.login).toHaveBeenCalledWith({
        username: 'admin',
        password: 'Password123'
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'token-admin');
      expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(component.errorMessage()).toBe('');
    });

    it('debería iniciar sesión y redirigir a /candidate/dashboard si el rol no es ROLE_ADMIN', () => {
      authServiceMock.login.mockReturnValue(of({ token: 'token-candidate', role: 'ROLE_CANDIDATE' }));

      component.loginForm.setValue({
        username: 'candidate',
        password: 'Password123'
      });

      component.onSubmit();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/candidate/dashboard']);
    });

    it('debería capturar el error del backend y mostrar mensaje personalizado', () => {
      const errorResponse = { error: { error: 'Credenciales inválidas' } };
      authServiceMock.login.mockReturnValue(throwError(() => errorResponse));

      component.loginForm.setValue({
        username: 'wrong',
        password: 'wrongpassword'
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('Credenciales inválidas');
    });

    it('debería mostrar mensaje de error por defecto si el backend no manda estructura', () => {
      authServiceMock.login.mockReturnValue(throwError(() => ({})));

      component.loginForm.setValue({
        username: 'wrong',
        password: 'wrongpassword'
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('Usuario o contraseña incorrectos.');
    });
  });
});