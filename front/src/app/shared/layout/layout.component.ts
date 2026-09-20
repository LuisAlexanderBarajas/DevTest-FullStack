import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../../features/auth/services/auth.service'; 
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private location = inject(Location);
  private authService = inject(AuthService);
  private routerSub!: Subscription;

  pageTitle = signal<string>('Panel de Control');
  showBackButton = signal<boolean>(false);

  ngOnInit() {
    this.updateTopbar(this.router.url);

    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateTopbar(event.urlAfterRedirects);
    });
  }

  ngOnDestroy() {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  // Lógica para cambiar título y mostrar botón de volver
  private updateTopbar(url: string) {
    if (url.includes('/assessment/create')) {
      this.pageTitle.set('Configuración de Evaluación');
      this.showBackButton.set(true);
    } else if (url.includes('/admin/management')) {
      this.pageTitle.set('Gestionar Evaluaciones');
      this.showBackButton.set(false);
    } else if (url.includes('/admin/podium')) {
      this.pageTitle.set('Podio y Resultados');
      this.showBackButton.set(false);
    } else if (url.includes('/candidate/dashboard')) {
      this.pageTitle.set('Información del Candidato');
      this.showBackButton.set(false);
    } else if (url.includes('/candidate/assessments')) {
      this.pageTitle.set('Evaluaciones Disponibles');
      this.showBackButton.set(false);
    } else if (url.includes('/assessment/result')) {
      this.pageTitle.set('Resultados de la Prueba');
      this.showBackButton.set(false);
    } else {
      this.pageTitle.set('Panel de Control');
      this.showBackButton.set(false);
    }
  }

  goBack() {
    this.location.back();
  }

  get isAdmin(): boolean {
    return this.authService.getRealRole() === 'ROLE_ADMIN';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  get currentUsername(): string {
    return this.authService.getRealUsername() || 'Usuario';
  }

  get userInitial(): string {
    const name = this.currentUsername;
    return name ? name.charAt(0).toUpperCase() : 'U';
  }
}