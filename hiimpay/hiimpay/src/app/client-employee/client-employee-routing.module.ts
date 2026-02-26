import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientEmployeeComponent } from './client-employee.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { AuthguardService } from '../auth/guards/authguard.service';
import { SurveyResponseComponent } from './pages/survey-response/survey-response.component';
import { ReminderComponent } from './pages/reminder/reminder.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FaquserComponent } from './pages/faquser/faquser.component';

const routes: Routes = [{ path: '', component: ClientEmployeeComponent,children:[
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthguardService] },
  { path: 'survey-response/:id', component:SurveyResponseComponent},
  { path:'reminder',component:ReminderComponent },
  { path:'profile',component:ProfileComponent},
  { path: 'faq', component:FaquserComponent },
] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientEmployeeRoutingModule { }
