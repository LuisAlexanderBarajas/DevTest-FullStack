import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const candidateGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const realRole = authService.getRealRole();

  if (!realRole) {
    localStorage.clear();
    router.navigate(['/login']);
    return false;
  }

  if (realRole === 'ROLE_CANDIDATE' || realRole === 'CANDIDATE') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};