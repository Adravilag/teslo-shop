import { Routes } from '@angular/router';
import { AdminDashboardLayoutComponent } from './layouts/admin-dashboard-layout/admin-dashboard-layout.component';
import { ProductsAdminPageComponent } from './pages/products-admin-page/products-admin-page.component';
import { IsAdminGuard } from '@app/auth/guards/is-admin.guard';
import { ProductAdminPageComponent } from './pages/product-admin-page/product-admin-page.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminDashboardLayoutComponent,
    canMatch: [IsAdminGuard],
    children: [
      {
        path: 'products',
        component: ProductsAdminPageComponent,
        title: 'Admin - Products',
      },
      {
        path: 'products/:id',
        component: ProductAdminPageComponent,
        title: 'Admin - Product Details',
      },
      {
        path: '**',
        redirectTo: 'products',
      },
    ],
  },
];
