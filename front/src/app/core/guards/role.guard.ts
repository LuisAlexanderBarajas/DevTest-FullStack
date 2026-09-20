import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const realRole = authService.getRealRole();

  if (!realRole) {
    localStorage.clear();
    router.navigate(['/login']);
    return false;
  }

  if (realRole === 'ROLE_ADMIN' || realRole === 'ADMIN') {
    return true;
  }

  router.navigate(['/candidate/dashboard']);
  return false;
};