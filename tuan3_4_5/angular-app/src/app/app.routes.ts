import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dang-nhap' },
  {
    path: 'dang-nhap',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'dang-ky',
    loadComponent: () => import('./features/register/register').then((m) => m.Register),
  },
  {
    path: 'quen-mat-khau',
    loadComponent: () =>
      import('./features/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'doi-mat-khau',
    loadComponent: () =>
      import('./features/change-password/change-password').then((m) => m.ChangePassword),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/user-list/user-list').then((m) => m.UserList),
  },
  {
    path: 'users/add',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/user-form/user-form').then((m) => m.UserForm),
  },
  {
    path: 'users/edit/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/user-form/user-form').then((m) => m.UserForm),
  },
  {
    path: 'users/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/users/user-detail/user-detail').then((m) => m.UserDetail),
  },
  { path: '**', redirectTo: 'dang-nhap' },
];
