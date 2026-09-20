import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { AssessmentFormService } from './assessment-form.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assessment-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './assessment-create.component.html',
  styleUrl: './assessment-create.component.css'
})
export class AssessmentCreateComponent implements OnInit {
  public formService = inject(AssessmentFormService); 
  
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isSubmitting = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  assessmentId = signal<number | null>(null);

  ngOnInit() {
    this.formService.resetForm();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.assessmentId.set(Number(id));
        this.loadAssessmentData(Number(id));
      } else {
        this.formService.addQuestion();
      }
    });
  }

  loadAssessmentData(id: number) {
    const url = `${environment.apiUrl.replace(/\/$/, '')}/assessments/${id}`;
    this.http.get<any>(url).subscribe({
      // El servicio se encarga de reconstruir el formulario con los datos
      next: (data) => this.formService.patchForm(data),
      error: (err) => {
        console.error('Error al cargar datos', err);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar la evaluación.',
          icon: 'error',
          confirmButtonColor: '#2563eb'
        }).then(() => {
          this.router.navigate(['/admin/management']);
        });
      }
    });
  }
  onSubmit() {
    if (this.formService.form.invalid || this.formService.questions.length === 0) {
      this.formService.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.formService.form.value;

    const sanitizedQuestions = formValue.questions.map((question: any) => {
      if (question.testCases) {
        question.testCases = question.testCases.map((tc: any) => ({
          ...tc,
          inputData: tc.inputData ? tc.inputData.trim() : '',
          expectedOutput: tc.expectedOutput ? tc.expectedOutput.trim() : ''
        }));
      }
      return question;
    });

    const payload = {
      ...formValue,
      questions: sanitizedQuestions,
      questionCount: this.formService.questions.length,
      isActive: true
    };

    const url = `${environment.apiUrl.replace(/\/$/, '')}/assessments`;
  
    const request = this.isEditMode() 
      ? this.http.put(`${url}/${this.assessmentId()}`, payload) 
      : this.http.post(url, payload);

    request.subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: `Evaluación ${this.isEditMode() ? 'actualizada' : 'creada'} exitosamente.`,
          icon: 'success',
          confirmButtonColor: '#10b981'
        }).then(() => {
          this.router.navigate(['/admin/management']);
        });
      },
      error: (err) => {
        console.error('Error al guardar', err);
        Swal.fire('Error', 'Ocurrió un error al guardar la evaluación.', 'error');
        this.isSubmitting.set(false);
      }
    });
  }
  
}