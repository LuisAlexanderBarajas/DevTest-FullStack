import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl.replace(/\/$/, '')}`;

  // Obtener todas las evaluaciones
  getAllAssessments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assessments`);
  }

  // Soft Delete / Eliminar evaluación
  deleteAssessment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/assessments/${id}`);
  }

  // Obtener el Podio / Ranking de candidatos
  getPodium(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/evaluations/podium`);
  }

  // Obtener el podio de un examen específico
  getPodiumByAssessmentId(assessmentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/evaluations/podium/${assessmentId}`);
  }
}