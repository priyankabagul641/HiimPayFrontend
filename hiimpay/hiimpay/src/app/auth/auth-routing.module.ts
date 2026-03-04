import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { AdminloginComponent } from './components/adminlogin/adminlogin.component';
import { ForgotpasswordComponent } from './components/forgotpassword/forgotpassword.component';
import { UserloginComponent } from './components/userlogin/userlogin.component';
import { HelpandSupportComponent } from './components/helpand-support/helpand-support.component';
import { LoginComponent } from '../client-employee/login/login.component';



const routes: Routes = [
  { path: '', component: AuthComponent,
children:[
  { path: '', component: AdminloginComponent ,pathMatch:'full'},
  { path: 'auth', component: AdminloginComponent },
  { path: 'forgotpassword', component: ForgotpasswordComponent },
  { path: 'userlogin', component: LoginComponent },
  { path: 'help', component: HelpandSupportComponent},
]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
