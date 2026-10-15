
import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink, RouterLinkActive } from '@angular/router';


interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  activeDepartments: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  stats = signal<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalDepartments: 0,
    activeDepartments: 0
  });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<DashboardStats>('http://localhost:8081/api/dashboard/stats')
      .subscribe({
        next: data => this.stats.set(data),
        error: error => console.error('Dashboard API error:', error)
      });
  }
}
