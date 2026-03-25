import { Component } from '@angular/core';
import { ClientEmployeeComponent } from '../../client-employee.component';

@Component({
  selector: 'app-client-dashboard-page',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardPageComponent {
  constructor(public shell: ClientEmployeeComponent) {}
}
