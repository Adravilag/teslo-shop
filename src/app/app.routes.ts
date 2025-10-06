import { Routes } from '@angular/router';
import { NotAuthenticatedGuard } from './auth/guards/not-authenticated.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.default),
    canMatch: [
      () => {
        // console.log('Lazy load Auth Module');
      }, NotAuthenticatedGuard
    ],
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin-dashboard/admin-dashboard.routes').then((m) => m.routes),
    // canMatch: [
    //   () => {
    //     console.log('Lazy load Admin Module');
    //   }, AuthGuard
    // ],
  },
  {
    path: '',
    loadChildren: () => import('./store-front/store-front.routes').then((m) => m.routes),
  },
];
