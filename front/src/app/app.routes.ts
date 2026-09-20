import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { DashboardComponent } from './features/assessments/pages/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { AssessmentSolveComponent } from './features/assessments/pages/assessment-solve/assessment-solve.component';
import { AssessmentCreateComponent } from './features/admin/pages/assessment-create/assessment-create.component';
import { AdminDashboardComponent } from './features/admin/pages/admin-dashboard/admin-dashboard.component';
import { roleGuard } from './core/guards/role.guard';
import { AssessmentManagementComponent } from './features/admin/pages/assessment-management/assessment-management.component';
import { PodiumComponent } from './features/admin/pages/podium/podium.component';
import { AvailableAssessmentsComponent } from './features/assessments/pages/available-assessments/available-assessments.component';
import { candidateGuard } from './core/guards/candidate.guard';
import { AssessmentResultComponent } from './features/assessments/pages/assessment-result/assessment-result.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // RUTAS DE ADMINISTRADOR
      { path: 'dashboard', component: AdminDashboardComponent, canActivate: [roleGuard] },
      { path: 'admin/management', component: AssessmentManagementComponent, canActivate: [roleGuard] },
      { path: 'admin/podium', component: PodiumComponent, canActivate: [roleGuard] },
      { path: 'assessment/create', component: AssessmentCreateComponent, canActivate: [roleGuard] },
      { path: 'assessment/edit/:id', component: AssessmentCreateComponent, canActivate: [roleGuard]},
      // RUTAS DE CANDIDATO
      { path: 'candidate/dashboard', component: DashboardComponent, canActivate: [candidateGuard] },
      { path: 'candidate/assessments', component: AvailableAssessmentsComponent, canActivate: [candidateGuard] },
      { path: 'assessment/:id', component: AssessmentSolveComponent, canActivate: [candidateGuard]},
      { path: 'assessment/result/:id', component: AssessmentResultComponent, canActivate: [authGuard] },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];