import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assessment-management',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './assessment-management.component.html',
  styleUrl: '../admin-dashboard/admin-dashboard.component.css'
})
export class AssessmentManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  
  assessments = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadAssessments();
  }

  loadAssessments() {
    this.isLoading.set(true);
    this.adminService.getAllAssessments().subscribe({
      next: (data) => {
        this.assessments.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar evaluaciones', err);
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
            this.loadAssessments(); 
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