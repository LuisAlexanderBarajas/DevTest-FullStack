import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-podium',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './podium.component.html',
  styleUrl: '../admin-dashboard/admin-dashboard.component.css'
})
export class PodiumComponent implements OnInit {
  private adminService = inject(AdminService);
  
  assessments = signal<any[]>([]);
  podiumList = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  selectedAssessmentId = signal<number | null>(null);

  ngOnInit() {
    this.loadAssessments();
  }

  loadAssessments() {
    this.adminService.getAllAssessments().subscribe({
      next: (data) => {
        this.assessments.set(data);
        if (data.length > 0) {
          this.selectedAssessmentId.set(data[0].id);
          this.loadPodium(data[0].id);
        } else {
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Error al cargar evaluaciones', err);
        this.isLoading.set(false);
      }
    });
  }

  onAssessmentChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const id = Number(target.value);
    this.selectedAssessmentId.set(id);
    this.loadPodium(id);
  }

  loadPodium(assessmentId: number) {
    this.isLoading.set(true);
    this.adminService.getPodiumByAssessmentId(assessmentId).subscribe({
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
}