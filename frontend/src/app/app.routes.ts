
import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Employees } from './employees/employees';
import { Departments } from './departments/departments';
import { Designations } from './designations/designations';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'employees', component: Employees },
  { path: 'departments', component: Departments },
  { path: 'designations', component: Designations },
  { path: '**', redirectTo: '' }
];
