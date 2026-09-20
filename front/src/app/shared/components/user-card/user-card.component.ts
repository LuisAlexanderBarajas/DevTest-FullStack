import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../features/auth/services/auth.service'; 

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css'
})
export class UserCardComponent implements OnInit {
  username: string = '';
  role: string | null = '';
  private authService = inject(AuthService);
  ngOnInit() {
    this.username = this.authService.getRealUsername() || 'Usuario';
    this.role = this.authService.getRealRole();
  }

  get isRoleAdmin(): boolean {
    return this.role === 'ROLE_ADMIN';
  }
}