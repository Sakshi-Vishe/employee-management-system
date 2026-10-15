
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

interface Department {
  id: number;
  name: string;
  code: string;
  active: boolean;
}

interface Designation {
  id: number;
  departmentId: number;
  name: string;
}

@Component({
  selector: 'app-designations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './designations.html',
  styleUrl: './designations.css'
})
export class Designations implements OnInit {
  private readonly api = 'http://localhost:8081/api/designations';
  private readonly departmentApi = 'http://localhost:8081/api/departments';

  designations: Designation[] = [];
  departments: Department[] = [];

  form: Designation = this.emptyForm();
  selectedDepartmentId: number | null = null;

  showForm = false;
  isEditing = false;
  loading = false;
  saving = false;
  deletingId: number | null = null;

  error = '';
  successMessage = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadDesignations();
  }

  private emptyForm(): Designation {
    return {
      id: 0,
      departmentId: 0,
      name: ''
    };
  }

  loadDepartments(): void {
    this.http.get<Department[]>(this.departmentApi).subscribe({
      next: data => {
        this.departments = [...data];
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Load departments error:', err);
        this.error = 'Unable to load departments.';
        this.cdr.detectChanges();
      }
    });
  }

  loadDesignations(): void {
    this.loading = true;

    this.http.get<Designation[]>(this.api)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: data => {
          this.designations = [...data];
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Load designations error:', err);
          this.error =
            err.error?.message ||
            `Unable to load designations (HTTP ${err.status || 'unknown'}).`;
          this.cdr.detectChanges();
        }
      });
  }

  get filteredDesignations(): Designation[] {
    if (
      this.selectedDepartmentId === null ||
      this.selectedDepartmentId === undefined ||
      this.selectedDepartmentId === ('' as any)
    ) {
      return this.designations;
    }

    const selectedId = Number(this.selectedDepartmentId);

    return this.designations.filter(
      designation => Number(designation.departmentId) === selectedId
    );
  }

  getDepartmentName(departmentId: number): string {
    return this.departments.find(
      department => Number(department.id) === Number(departmentId)
    )?.name || 'Unknown department';
  }

  openAddForm(): void {
    this.form = this.emptyForm();
    this.isEditing = false;
    this.showForm = true;
    this.error = '';
    this.successMessage = '';
  }

  editDesignation(designation: Designation): void {
    this.form = { ...designation };
    this.isEditing = true;
    this.showForm = true;
    this.error = '';
    this.successMessage = '';
  }

  cancelForm(): void {
    if (this.saving) {
      return;
    }

    this.showForm = false;
    this.form = this.emptyForm();
    this.error = '';
  }

  saveDesignation(): void {
    const name = this.form.name.trim();
    const departmentId = Number(this.form.departmentId);

    if (!name) {
      this.error = 'Designation name is required.';
      return;
    }

    if (!departmentId) {
      this.error = 'Please select a department.';
      return;
    }

    const duplicate = this.designations.some(item =>
      Number(item.departmentId) === departmentId &&
      item.name.trim().toLowerCase() === name.toLowerCase() &&
      (!this.isEditing || item.id !== this.form.id)
    );

    if (duplicate) {
      this.error =
        'This designation already exists in the selected department.';
      return;
    }

    if (this.saving) {
      return;
    }

    this.saving = true;
    this.error = '';
    this.successMessage = '';

    const isUpdate = this.isEditing;
    const id = this.form.id;
    const payload = { name, departmentId };

    const request = isUpdate
      ? this.http.put<Designation>(`${this.api}/${id}`, payload)
      : this.http.post<Designation>(this.api, payload);

    request.pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.successMessage = isUpdate
          ? 'Designation updated successfully.'
          : 'Designation added successfully.';

        this.showForm = false;
        this.form = this.emptyForm();
        this.loadDesignations();
      },
      error: err => {
        console.error('Save designation error:', err);
        this.error =
          err.error?.message ||
          err.error?.error ||
          `Unable to save designation (HTTP ${err.status || 'unknown'}).`;
        this.cdr.detectChanges();
      }
    });
  }

  deleteDesignation(designation: Designation): void {
    if (this.deletingId !== null) {
      return;
    }

    if (!confirm(`Delete designation "${designation.name}"?`)) {
      return;
    }

    this.error = '';
    this.successMessage = '';
    this.deletingId = designation.id;

    this.http.delete<void>(`${this.api}/${designation.id}`)
      .pipe(
        finalize(() => {
          this.deletingId = null;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.designations = this.designations.filter(
            item => item.id !== designation.id
          );
          this.successMessage = 'Designation deleted successfully.';
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Delete designation error:', err);
          this.error =
            err.error?.message ||
            err.error?.error ||
            `Unable to delete designation (HTTP ${err.status || 'unknown'}).`;
          this.cdr.detectChanges();
        }
      });
  }
}
