import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  departmentId: number | null;
  designationId: number | null;
  employmentType: string;
  contractEndDate: string | null;
  joiningDate: string;
  salary: number | null;
  address: string;
  active: boolean;
}

interface EmployeeForm {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  departmentId: number | null;
  designationId: number | null;
  employmentType: string;
  contractEndDate: string;
  joiningDate: string;
  salary: number | null;
  address: string;
  active: boolean;
}

interface FormFieldConfig {
  key: string;
  label: string;
  type: string;
  required: boolean;
  optionsApi: string | null;
  validationJson: string | null;
  visibleWhen: string | null;
  displayOrder: number;
}

interface DropdownOption {
  id?: number;
  value?: string;
  label?: string;
  name?: string;
  code?: string;
  departmentId?: number | null;
  active?: boolean;
}

interface EmployeePage {
  content?: Employee[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './employees.html',
  styleUrl: './employees.css'
})
export class Employees implements OnInit {
  private readonly api = 'http://localhost:8081/api/employees';
  private readonly baseApi = 'http://localhost:8081/api';

  employees: Employee[] = [];
  totalElements = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  formFields: FormFieldConfig[] = [];

  genders: DropdownOption[] = [];
  employmentTypes: DropdownOption[] = [];
  departments: DropdownOption[] = [];
  designations: DropdownOption[] = [];

  searchText = '';
  loading = false;
  error = '';
  showAddForm = false;
  isSaving = false;
  isEditing = false;
  editingId: number | null = null;
  successMessage = '';

  showDeleteModal = false;
  employeeToDelete: number | null = null;
  isDeleting = false;

  form: EmployeeForm = this.emptyForm();

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadFormConfig();
    this.loadLookups();
    this.loadDepartments();
  }

  emptyForm(): EmployeeForm {
    return {
      employeeCode: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      departmentId: null,
      designationId: null,
      employmentType: '',
      contractEndDate: '',
      joiningDate: '',
      salary: null,
      address: '',
      active: true
    };
  }

  // Only show designations belonging to the selected department.
  get filteredDesignations(): DropdownOption[] {
    if (this.form.departmentId == null) {
      return [];
    }

    return this.designations.filter(
      designation =>
        designation.id != null &&
        designation.departmentId != null &&
        Number(designation.departmentId) === Number(this.form.departmentId)
    );
  }

  loadFormConfig(): void {
    this.http.get<FormFieldConfig[]>(
      `${this.baseApi}/form-config/employee`
    ).subscribe({
      next: fields => {
        this.formFields = [...(fields ?? [])].sort(
          (a, b) => a.displayOrder - b.displayOrder
        );
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Form configuration error:', err);
        this.error =
          `Unable to load form configuration (HTTP ${err.status}).`;
        this.cdr.detectChanges();
      }
    });
  }

  loadLookups(): void {
    this.http.get<DropdownOption[]>(
      `${this.baseApi}/lookups/GENDER`
    ).subscribe({
      next: data => {
        this.genders = data ?? [];
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Gender lookup error:', err);
      }
    });

    this.http.get<DropdownOption[]>(
      `${this.baseApi}/lookups/EMPLOYMENT_TYPE`
    ).subscribe({
      next: data => {
        this.employmentTypes = data ?? [];
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Employment type lookup error:', err);
      }
    });
  }

  loadDepartments(): void {
    this.http.get<DropdownOption[]>(
      `${this.baseApi}/departments`
    ).subscribe({
      next: data => {
        this.departments = (data ?? []).map(department => ({
          ...department,
          id: department.id == null ? undefined : Number(department.id)
        }));

        console.log('Departments loaded:', this.departments);
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Department loading error:', err);
        this.error = 'Unable to load departments.';
        this.cdr.detectChanges();
      }
    });
  }

  loadDesignations(
    departmentId: number | null,
    selectedDesignationId: number | null = null
  ): void {
    this.designations = [];
    this.form.designationId = null;

    if (
      departmentId == null ||
      !Number.isFinite(Number(departmentId))
    ) {
      this.cdr.detectChanges();
      return;
    }

    const requestedDepartmentId = Number(departmentId);
    const url =
      `${this.baseApi}/departments/${requestedDepartmentId}/designations`;

    console.log('Loading designations from:', url);

    this.http.get<unknown>(url).subscribe({
      next: response => {
        // Support either a direct array or a wrapped API response.
        const result = Array.isArray(response)
          ? response
          : (
              (response as { content?: unknown[]; designations?: unknown[] })
                ?.content ??
              (response as { designations?: unknown[] })
                ?.designations ??
              []
            );

        // Ignore stale responses if the user selected another department.
        if (
          this.form.departmentId == null ||
          Number(this.form.departmentId) !== requestedDepartmentId
        ) {
          return;
        }

        this.designations = (result as DropdownOption[])
          .filter(item => item && item.id != null)
          .map(item => ({
            ...item,
            id: Number(item.id),
            // The endpoint is department-specific. If it omits
            // departmentId, safely associate the result with that department.
            departmentId:
              item.departmentId == null
                ? requestedDepartmentId
                : Number(item.departmentId)
          }))
          .filter(
            item =>
              item.departmentId === requestedDepartmentId
          );

        const matchingDesignation = this.designations.find(
          item => Number(item.id) === Number(selectedDesignationId)
        );

        this.form.designationId =
          matchingDesignation?.id != null
            ? Number(matchingDesignation.id)
            : null;

        console.log(
          'Designations available for department',
          requestedDepartmentId,
          this.designations
        );

        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Designation loading error:', err);

        if (
          Number(this.form.departmentId) === requestedDepartmentId
        ) {
          this.designations = [];
          this.form.designationId = null;
          this.error =
            'Unable to load designations for the selected department.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  onDepartmentChange(value: number | string | null): void {
    const departmentId =
      value === null || value === ''
        ? null
        : Number(value);

    this.form.departmentId =
      departmentId !== null && Number.isFinite(departmentId)
        ? departmentId
        : null;

    // A designation from the previous department must never remain selected.
    this.form.designationId = null;
    this.designations = [];
    this.error = '';

    console.log('Department changed to:', this.form.departmentId);

    if (this.form.departmentId !== null) {
      this.loadDesignations(this.form.departmentId);
    }

    this.cdr.detectChanges();
  }

  isFieldVisible(field: FormFieldConfig): boolean {
    if (!field.visibleWhen) {
      return true;
    }

    if (field.visibleWhen === 'departmentId') {
      return this.form.departmentId != null;
    }

    if (field.visibleWhen.startsWith('employmentType:')) {
      const allowedTypes = field.visibleWhen
        .split(':')[1]
        .split(',')
        .map(value => value.trim().toUpperCase());

      return allowedTypes.includes(
        (this.form.employmentType || '').toUpperCase()
      );
    }

    return true;
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = '';

    const params = new HttpParams()
     .set('page', String(this.currentPage))
      .set('size', String(this.pageSize))
      .set('search', this.searchText.trim());

    this.http.get<EmployeePage>(this.api, { params })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: data => {
          this.employees = data.content ?? [];
          this.totalElements = data.totalElements ?? 0;
          this.totalPages = data.totalPages ?? 0;
          this.currentPage = (data.number ?? (this.currentPage - 1)) + 1;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Load employees error:', err);
          this.error =
            `Unable to load employees (HTTP ${err.status}).`;
          this.cdr.detectChanges();
        }
      });
  }

  searchEmployees(): Employee[] {
    return this.employees;
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.loadEmployees();
  }

  openAddForm(): void {
    if (this.isSaving) return;

    this.form = this.emptyForm();
    this.designations = [];
    this.isEditing = false;
    this.editingId = null;
    this.error = '';
    this.successMessage = '';
    this.showAddForm = true;
    this.cdr.detectChanges();
  }

  editEmployee(employee: Employee): void {
    if (this.isSaving) return;

    this.error = '';
    this.successMessage = '';
    this.isEditing = true;
    this.editingId = employee.id;

    this.form = {
      employeeCode: employee.employeeCode ?? '',
      firstName: employee.firstName ?? '',
      lastName: employee.lastName ?? '',
      email: employee.email ?? '',
      phone: employee.phone ?? '',
      dateOfBirth: employee.dateOfBirth?.substring(0, 10) ?? '',
      gender: employee.gender ?? '',
      departmentId:
        employee.departmentId == null
          ? null
          : Number(employee.departmentId),
      designationId:
        employee.designationId == null
          ? null
          : Number(employee.designationId),
      employmentType: employee.employmentType ?? '',
      contractEndDate:
        employee.contractEndDate?.substring(0, 10) ?? '',
      joiningDate: employee.joiningDate?.substring(0, 10) ?? '',
      salary: employee.salary ?? null,
      address: employee.address ?? '',
      active: employee.active ?? true
    };

    this.showAddForm = true;

    this.loadDesignations(
      this.form.departmentId,
      this.form.designationId
    );

    this.cdr.detectChanges();
  }

  cancelAddForm(): void {
    if (this.isSaving) return;

    this.showAddForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.form = this.emptyForm();
    this.designations = [];
    this.error = '';
    this.cdr.detectChanges();
  }

  saveEmployee(): void {
    if (this.isSaving) return;

    this.error = '';
    this.successMessage = '';
    
  
    // Block updates when Gender is missing or invalid.
const selectedGender = String(this.form.gender ?? '').trim();

if (selectedGender === '') {
  this.error = 'Gender is required. Please select Male or Female.';
  this.cdr.detectChanges();
  return;
}
    // Prevent updating when Gender is blank or doesn't match an option.
const genderValue = String(this.form.gender ?? '').trim();

if (
  this.form.gender == null ||
  String(this.form.gender).trim() === ''
) {
  this.error = 'Gender is required. Please select Male or Female.';
  this.cdr.detectChanges();
  return;
}

    const requiredFields: {
      key: keyof EmployeeForm;
      label: string;
    }[] = [
      { key: 'employeeCode', label: 'Employee Code' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Mobile Number' },
      { key: 'dateOfBirth', label: 'Date of Birth' },
      { key: 'gender', label: 'Gender' },
      { key: 'departmentId', label: 'Department' },
      { key: 'designationId', label: 'Designation' },
      { key: 'employmentType', label: 'Employment Type' },
      { key: 'joiningDate', label: 'Joining Date' },
      { key: 'salary', label: 'Salary' },
      { key: 'address', label: 'Address' }
    ];

    for (const field of requiredFields) {
      const value = this.form[field.key];

      if (
        value === null ||
        value === undefined ||
        (typeof value === 'string' && !value.trim())
      ) {
        this.error = `${field.label} is required.`;
        return;
      }
    }

    if (!emailPattern.test(this.form.email.trim())) {
      this.error = 'Please enter a valid Email address.';
      return;
    }

    if (!/^[0-9]{10}$/.test(this.form.phone.trim())) {
      this.error = 'Please enter a valid 10-digit Mobile Number.';
      return;
    }

    if (this.form.salary === null || this.form.salary <= 0) {
      this.error = 'Salary must be greater than zero.';
      return;
    }

    if (
      this.form.dateOfBirth &&
      this.form.joiningDate &&
      this.form.dateOfBirth >= this.form.joiningDate
    ) {
      this.error = 'Date of Birth must be before Joining Date.';
      return;
    }

    if (
      ['CONTRACT', 'INTERN'].includes(
        this.form.employmentType.toUpperCase()
      )
    ) {
      if (!this.form.contractEndDate) {
        this.error = 'Contract End Date is required.';
        return;
      }

      if (this.form.contractEndDate <= this.form.joiningDate) {
        this.error = 'Contract End Date must be after Joining Date.';
        return;
      }
    }

    // Ensure the selected designation belongs to the selected department.
    const selectedDesignation = this.filteredDesignations.find(
      option => Number(option.id) === Number(this.form.designationId)
    );

    if (
      this.form.departmentId === null ||
      this.form.designationId === null ||
      !selectedDesignation
    ) {
      this.error =
        'Please select a designation that belongs to the selected department.';
      return;
    }

    if (
      selectedDesignation.departmentId == null ||
      Number(selectedDesignation.departmentId) !==
        Number(this.form.departmentId)
    ) {
      this.error =
        'The selected designation does not belong to the selected department.';
      return;
    }

    const payload = {
      ...this.form,
      departmentId: Number(this.form.departmentId),
      designationId: Number(this.form.designationId),
      employeeCode: this.form.employeeCode.trim(),
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      email: this.form.email.trim(),
      phone: this.form.phone.trim(),
      address: this.form.address.trim(),
      contractEndDate: this.form.contractEndDate || null
    };

    const updating =
      this.isEditing && this.editingId !== null;

    const employeeId = this.editingId;

    if (this.isEditing && employeeId === null) {
      this.error = 'Unable to identify the employee being edited.';
      return;
    }

    this.isSaving = true;
console.log('Gender being saved:', JSON.stringify(this.form.gender));
    const request = updating
      ? this.http.put(`${this.api}/${employeeId}`, payload)
      : this.http.post(this.api, payload);

    request.pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.showAddForm = false;
        this.isEditing = false;
        this.editingId = null;
        this.form = this.emptyForm();
        this.designations = [];
        this.error = '';

        this.successMessage = updating
          ? 'Employee updated successfully!'
          : 'Employee added successfully!';

        this.loadEmployees();
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Save/update employee error:', err);
        this.error =
          err.error?.message ||
          err.error?.error ||
          'Unable to save employee. Please check the entered details.';
        this.cdr.detectChanges();
      }

      
    });
    
  }

  confirmDelete(id: number): void {
    this.employeeToDelete = id;
    this.showDeleteModal = true;
    this.error = '';
    this.successMessage = '';
  }

  cancelDelete(): void {
    if (this.isDeleting) return;

    this.showDeleteModal = false;
    this.employeeToDelete = null;
    this.error = '';
    this.cdr.detectChanges();
  }

  deleteEmployee(): void {
    if (
      this.employeeToDelete === null ||
      this.isDeleting
    ) {
      return;
    }

    this.isDeleting = true;
    this.error = '';

    this.http.delete(
      `${this.api}/${this.employeeToDelete}`
    ).pipe(
      finalize(() => {
        this.isDeleting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.employeeToDelete = null;
        this.successMessage = 'Employee deleted successfully!';

        this.loadEmployees();
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Delete employee error:', err);
        this.error =
          err.error?.message ||
          'Unable to delete employee. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
  previousPage(): void {
  if (this.loading || this.currentPage <= 1) {
    return;
  }

  this.currentPage--;
  this.loadEmployees();
}

nextPage(): void {
  if (this.loading || this.currentPage >= this.totalPages) {
    return;
  }

  this.currentPage++;
  this.loadEmployees();
}
}


const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;