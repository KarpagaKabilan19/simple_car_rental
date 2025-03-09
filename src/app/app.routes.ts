import { Routes } from '@angular/router';
import { UserComponent } from './user/user.component';
import { CarStatusComponent } from './car-status/car-status.component';
import { AdminComponent } from './admin/admin.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  { path: 'user', component: UserComponent },
  { path: 'car-status', component: CarStatusComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];