import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../features/auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})

export class AssessmentService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl.replace(/\/$/, '')}/assessments`;
  private evalUrl = `${environment.apiUrl.replace(/\/$/, '')}/evaluations`;

  getAllAssessments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getAssessmentById(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getMyAttempts(): Observable<any[]> {
    const userId = this.authService.getRealUserId();
    return this.http.get<any[]>(`${this.evalUrl}/user/${userId}`);
  }

  startAssessment(userId: number, assessmentId: number): Observable<any> {
    return this.http.post<any>(`${this.evalUrl}/start?userId=${userId}&assessmentId=${assessmentId}`, {});
  }

  submitAssessment(attemptId: number, submissions: any[]): Observable<any> {
    return this.http.post<any>(`${this.evalUrl}/${attemptId}/submit`, submissions);
  }

  getAttemptById(attemptId: number | string): Observable<any> {
    return this.http.get<any>(`${this.evalUrl}/attempt/${attemptId}`);
  }

  // Obtener el podio de un examen específico
  getPodiumByAssessmentId(assessmentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.evalUrl}/podium/${assessmentId}`);
  }

}