import { Component } from '@angular/core';
import { UserCardComponent } from '../../../../shared/components/user-card/user-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [UserCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}