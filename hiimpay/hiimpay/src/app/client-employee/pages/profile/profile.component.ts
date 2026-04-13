import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProfileUpdateDialogComponent } from '../profile-update-dialog/profile-update-dialog.component';
import { DeleteComponent } from '../../../superadmin/pages/delete/delete.component';
import { EmployeeService } from '../../service/employee.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  profileInfo: any;
  activeTab: 'profile' | 'transactions' | 'epay' | 'autopay' | 'helpdesk' = 'profile';

  constructor(private dialog: MatDialog, private api: EmployeeService, private tosatr: ToastrService, private router: Router) {}

  ngOnInit(): void {
    this.profileInfo = JSON.parse(
      sessionStorage.getItem('currentLoggedInUserData')!
    );
  }

  goToTransactions() {
    this.router.navigate(['/clientEmployee/transactions']);
  }

  goToHelpdesk() {
    this.router.navigate(['/clientEmployee/faq']);
  }

  changePassword() {
    this.onEdit();
  }

  onEdit() {
    const dialogRef = this.dialog.open(ProfileUpdateDialogComponent, {
      width: '600px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result.action == 'ok') {
        this.profileInfo = JSON.parse(
          sessionStorage.getItem('currentLoggedInUserData')!
        );
      }
    });
  }

  onDelete(){
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: {
        message: `Do you really want to deactivate your profile ?`,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result.action == 'ok') {
        this.api.deleteUserProfile(this.profileInfo.id).subscribe((res: any) => {
          if (res.message=="User updated successfully.") {
            this.tosatr.success("Profile successfully deactivated");
            window.location.reload();
            sessionStorage.clear();
            this.router.navigate(['/auth/userlogin']);
          }
        });
      }
    });
  }
}
