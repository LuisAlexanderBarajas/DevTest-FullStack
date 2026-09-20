import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { AssessmentService } from '../../services/assessment.service';
@Component({
  selector: 'app-assessment-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-result.component.html',
  styleUrl: './assessment-result.component.css'
})
export class AssessmentResultComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assessmentService = inject(AssessmentService);
  private authService = inject(AuthService);
  

  attemptId: string | null = null;
  resultData: any = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit() {
    this.attemptId = this.route.snapshot.paramMap.get('id');
    if (this.attemptId) {
      this.fetchResults(this.attemptId);
    }
  }

  fetchResults(id: string) {
    this.assessmentService.getAttemptById(id).subscribe({
      next: (res) => {
        this.resultData = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar resultados', err);
        this.errorMessage = 'No se pudieron cargar los resultados de la evaluación.';
        this.isLoading = false;
      }
    });
  }

  goBack() {
    const role = this.authService.getRealRole();
    if (role === 'ROLE_ADMIN' || role === 'ADMIN') {
      this.router.navigate(['/admin/podium']);
    } else {
      this.router.navigate(['candidate/assessments']);
    }
  }
}