import { TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    authServiceMock = {
      register: jest.fn().mockReturnValue(of({}))
    };

    routerMock = {
      navigate: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: {} }
      ]
    });

    TestBed.runInInjectionContext(() => {
      component = new RegisterComponent();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('Validaciones del Formulario', () => {
    it('debería marcar el formulario como inválido si está vacío', () => {
      expect(component.registerForm.valid).toBe(false);
    });

    it('debería validar username', () => {
      const usernameControl = component.registerForm.controls['username'];
      
      usernameControl.setValue('');
      expect(usernameControl.hasError('required')).toBe(true);

      usernameControl.setValue('abc');
      expect(usernameControl.hasError('minlength')).toBe(true);

      usernameControl.setValue('user_name!');
      expect(usernameControl.hasError('pattern')).toBe(true);

      usernameControl.setValue('User123');
      expect(usernameControl.valid).toBe(true);
    });

    it('debería validar email', () => {
      const emailControl = component.registerForm.controls['email'];

      emailControl.setValue('');
      expect(emailControl.hasError('required')).toBe(true);

      emailControl.setValue('correo-invalido');
      expect(emailControl.hasError('email')).toBe(true);

      emailControl.setValue('test@example.com');
      expect(emailControl.valid).toBe(true);
    });

    it('debería validar password', () => {
      const passwordControl = component.registerForm.controls['password'];

      passwordControl.setValue('');
      expect(passwordControl.hasError('required')).toBe(true);

      passwordControl.setValue('short1A');
      expect(passwordControl.hasError('minlength')).toBe(true);

      passwordControl.setValue('passwordwithoutuppercase1');
      expect(passwordControl.hasError('pattern')).toBe(true);

      passwordControl.setValue('Password123');
      expect(passwordControl.valid).toBe(true);
    });
  });

  describe('onSubmit', () => {
    it('debería marcar campos como tocados si el formulario es inválido', () => {
      const markAllSpy = jest.spyOn(component.registerForm, 'markAllAsTouched');
      
      component.onSubmit();

      expect(markAllSpy).toHaveBeenCalled();
      expect(authServiceMock.register).not.toHaveBeenCalled();
    });

    it('debería registrar exitosamente y redirigir', () => {
      jest.useFakeTimers();
      authServiceMock.register.mockReturnValue(of({ success: true }));

      component.registerForm.setValue({
        username: 'User123',
        email: 'test@example.com',
        password: 'Password123'
      });

      component.onSubmit();

      expect(authServiceMock.register).toHaveBeenCalledWith({
        username: 'User123',
        email: 'test@example.com',
        password: 'Password123'
      });
      expect(component.successMessage()).toBe('¡Registro exitoso! Redirigiendo al login...');
      expect(component.errorMessage()).toBe('');

      jest.advanceTimersByTime(2000);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('debería capturar el error del backend', () => {
      const errorResponse = { error: { error: 'El usuario ya existe' } };
      authServiceMock.register.mockReturnValue(throwError(() => errorResponse));

      component.registerForm.setValue({
        username: 'User123',
        email: 'test@example.com',
        password: 'Password123'
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('El usuario ya existe');
      expect(component.successMessage()).toBe('');
    });

    it('debería mostrar mensaje de error por defecto', () => {
      authServiceMock.register.mockReturnValue(throwError(() => ({})));

      component.registerForm.setValue({
        username: 'User123',
        email: 'test@example.com',
        password: 'Password123'
      });

      component.onSubmit();

      expect(component.errorMessage()).toBe('Ocurrió un error inesperado.');
    });
  });
});