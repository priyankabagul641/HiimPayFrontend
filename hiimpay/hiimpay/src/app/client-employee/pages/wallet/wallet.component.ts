import { Component } from '@angular/core';
import { ClientEmployeeComponent } from '../../client-employee.component';

@Component({
  selector: 'app-wallet-page',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent {
  constructor(public shell: ClientEmployeeComponent) {}
}
