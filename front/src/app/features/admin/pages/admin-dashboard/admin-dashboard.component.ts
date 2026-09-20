import { Component, inject, OnInit, signal } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { UserCardComponent } from '../../../../shared/components/user-card/user-card.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, UserCardComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  assessments = signal<any[]>([]);
  podiumList = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadAdminData();
  }

  loadAdminData() {
    this.isLoading.set(true);
    
    // Cargamos evaluaciones
    this.adminService.getAllAssessments().subscribe({
      next: (data) => this.assessments.set(data),
      error: (err) => console.error('Error al cargar evaluaciones', err)
    });

    // Cargamos el Podio
    this.adminService.getPodium().subscribe({
      next: (data) => {
        this.podiumList.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar podio', err);
        this.isLoading.set(false);
      }
    });
  }

  deleteAssessment(id: number, name: string) {
    Swal.fire({
      title: '¿Eliminar evaluación?',
      text: `¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.deleteAssessment(id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Eliminada!',
              text: 'La evaluación fue eliminada correctamente.',
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
            this.loadAdminData(); 
          },
          error: (err) => {
            console.error('Error al eliminar', err);
            Swal.fire('Error', 'No se pudo eliminar la evaluación.', 'error');
          }
        });
      }
    });
  }
}