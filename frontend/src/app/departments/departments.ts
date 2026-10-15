
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

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.html'
})
export class Departments implements OnInit {
  private readonly api = 'http://localhost:8081/api/departments';

  departments: Department[] = [];
  form: Department = this.emptyForm();

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
  }

  private emptyForm(): Department {
    return {
      id: 0,
      name: '',
      code: '',
      active: true
    };
  }

 loadDepartments(): void {
  this.loading = true;

  this.http.get<Department[]>(this.api)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (data) => {
        this.departments = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Load departments error:', err);

        this.error =
          err.error?.message ||
          `Unable to load departments (HTTP ${err.status || 'unknown'}).`;

        this.cdr.detectChanges();
      }
    });
}

  openAddForm(): void {
    this.form = this.emptyForm();
    this.isEditing = false;
    this.showForm = true;
    this.error = '';
    this.successMessage = '';
  }

  editDepartment(department: Department): void {
    this.form = { ...department };
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


saveDepartment(): void {
  const name = this.form.name.trim();
  const code = this.form.code.trim();

  if (!name || !code) {
    this.error = 'Department name and code are required.';
    return;
  }

  // Check whether the department code already exists.
  const duplicateCode = this.departments.some(
    department =>
      department.code.trim().toLowerCase() === code.toLowerCase() &&
      (!this.isEditing || department.id !== this.form.id)
  );

  if (duplicateCode) {
    this.error = 'Department code must be unique.';
    return;
  }

  if (this.saving) {
    return;
  }

  this.saving = true;
  this.error = '';
  this.successMessage = '';

  const isUpdate = this.isEditing;
  const departmentId = this.form.id;

  const payload = {
    name,
    code,
    active: this.form.active
  };

  const request = isUpdate
    ? this.http.put<Department>(
        `${this.api}/${departmentId}`,
        payload
      )
    : this.http.post<Department>(this.api, payload);

  request
    .pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (savedDepartment) => {
        if (!savedDepartment || savedDepartment.id == null) {
          this.error =
            'The server did not return the saved department ID.';
          this.loadDepartments();
          return;
        }

        if (isUpdate) {
          this.departments = this.departments.map(department =>
            department.id === savedDepartment.id
              ? savedDepartment
              : department
          );

          this.successMessage = 'Department updated successfully.';
        } else {
          this.departments = [
            ...this.departments.filter(
              department => department.id !== savedDepartment.id
            ),
            savedDepartment
          ];

          this.successMessage = 'Department added successfully.';
        }

        this.showForm = false;
        this.form = this.emptyForm();

        this.loadDepartments();
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Save department error:', err);

        if (
          err.status === 500 &&
          (err.error?.message || '').toLowerCase().includes('duplicate entry')
        ) {
          this.error = 'Department code must be unique.';
        } else {
          this.error =
            err.error?.message ||
            err.error?.error ||
            `Unable to save department (HTTP ${err.status || 'unknown'}).`;
        }

        this.cdr.detectChanges();
      }
    });
}


  deleteDepartment(department: Department): void {
    if (this.deletingId !== null) {
      return;
    }

    if (!confirm(`Delete department "${department.name}"?`)) {
      return;
    }

    this.error = '';
    this.successMessage = '';
    this.deletingId = department.id;

    this.http.delete<void>(`${this.api}/${department.id}`)
      .pipe(
        finalize(() => {
          this.deletingId = null;
        })
      )
      .subscribe({
        next: () => {
          this.departments = this.departments.filter(
            item => item.id !== department.id
          );

          this.successMessage = 'Department deleted successfully.';
          this.loadDepartments();
        },
        error: (err) => {
          console.error('Delete department error:', err);

          this.error =
            err.error?.message ||
            err.error?.error ||
            `Unable to delete department (HTTP ${err.status || 'unknown'}).`;
        }
      });
  }
}
