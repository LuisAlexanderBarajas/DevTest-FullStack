import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-available-assessments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './available-assessments.component.html',
  styleUrl: './available-assessments.component.css'
})
export class AvailableAssessmentsComponent implements OnInit {
  private assessmentService = inject(AssessmentService);
  private authService = inject(AuthService);
  private router = inject(Router);

  assessments = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.assessmentService.getAllAssessments().subscribe({
      next: (assessmentsList) => {
        this.assessmentService.getMyAttempts().subscribe({
          next: (attemptsList) => {
            const enrichedAssessments = assessmentsList.map(assessment => {
              const attempt = attemptsList.find((a: any) => a.assessment.id === assessment.id);
              return {
                ...assessment,
                status: attempt ? attempt.status : 'NOT_STARTED',
                attemptId: attempt ? attempt.id : null
              };
            });

            this.assessments.set(enrichedAssessments);
            this.isLoading.set(false);
          },
          error: () => {
            this.assessments.set(assessmentsList);
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar assessments', err);
        this.isLoading.set(false);
      }
    });
  }

  handleAssessmentAction(assessment: any) {
    if (assessment.status === 'COMPLETED') {
      this.router.navigate([`/assessment/result/${assessment.attemptId}`]);
      
    } else if (assessment.status === 'IN_PROGRESS') {
      this.router.navigate([`/assessment/${assessment.attemptId}`]);
      
    } else {
      const userId = this.authService.getRealUserId();
      if (!userId) return;

      this.assessmentService.startAssessment(userId, assessment.id).subscribe({
        next: (res) => {
          this.router.navigate([`/assessment/${res.id}`]);
        },
        error: (err) => {
          console.error('Error al iniciar evaluación', err);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo iniciar la evaluación. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonColor: '#2563eb'
          });
        }
      });
    }
  }
}