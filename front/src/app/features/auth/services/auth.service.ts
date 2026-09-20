import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}auth`; 

  login(credentials: { username: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.clear();
        localStorage.setItem('token', response.token);
        
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData); 
  }

  private getDecodedToken(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  getRealRole(): string | null {
    const decoded = this.getDecodedToken();
    return decoded ? decoded.role : null;
  }

  getRealUserId(): number | null {
    const decoded = this.getDecodedToken();
    return decoded ? decoded.userId : null;
  }

  getRealUsername(): string | null {
    const decoded = this.getDecodedToken();
    return decoded ? decoded.sub : null; 
  }
}