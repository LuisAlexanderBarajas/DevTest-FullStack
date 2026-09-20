import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string>('');

  loginForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.errorMessage.set('');

    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          localStorage.setItem('token', res.token);

          if (res.role === 'ROLE_ADMIN') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/candidate/dashboard']);
          }
        },
        error: (err) => {
          this.errorMessage.set(err.error?.error || 'Usuario o contraseña incorrectos.');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}