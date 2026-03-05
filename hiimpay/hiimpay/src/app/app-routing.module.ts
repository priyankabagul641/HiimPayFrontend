import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthguardService } from './auth/guards/authguard.service';


const routes: Routes = [
  { path: '', redirectTo: '/clientEmployee/login', pathMatch: 'full' },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: 'superadmin', loadChildren: () => import('./superadmin/superadmin.module').then(m => m.SuperadminModule),canActivate:[AuthguardService] },
  { path: 'cpoc/:id', loadChildren: () => import('./superadmin/project/project.module').then(m => m.ProjectModule),canActivate:[AuthguardService] },
  { path: 'clientEmployee', loadChildren: () => import('./client-employee/client-employee.module').then(m => m.ClientEmployeeModule) },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
