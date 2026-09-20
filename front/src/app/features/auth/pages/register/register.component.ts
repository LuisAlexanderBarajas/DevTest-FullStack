import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  registerForm: FormGroup = this.fb.group({
    username: ['', [
      Validators.required, 
      Validators.minLength(4),
      Validators.pattern('^[a-zA-Z0-9]+$')
    ]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
    ]]
  });

  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.successMessage.set('¡Registro exitoso! Redirigiendo al login...');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.error || 'Ocurrió un error inesperado.');
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}