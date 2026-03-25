import { Component } from '@angular/core';
import { ClientEmployeeComponent } from '../../client-employee.component';

@Component({
  selector: 'app-my-coupons-page',
  templateUrl: './my-coupons.component.html',
  styleUrls: ['./my-coupons.component.css']
})
export class MyCouponsComponent {
  constructor(public shell: ClientEmployeeComponent) {}
}
