import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectService } from '../../../services/companyService';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.css'
})
export class CreateUserComponent implements OnInit {
  btnName: string = 'Create User';
  createForm!: FormGroup;
  isLoading: boolean = false;
  companyId: number = 0;

  constructor(
    private dialogRef: MatDialogRef<CreateUserComponent>,
    @Inject(DIALOG_DATA) public data: { name: string; id?: number; companyId: number },
    private service: ProjectService,
    private fb: FormBuilder,
    private toster: ToastrService
  ) { }

  ngOnInit(): void {
    const userData = JSON.parse(sessionStorage.getItem('currentLoggedInUserData')!);
    this.companyId = this.data?.companyId || userData?.companyId;

    this.createForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      passwordHash: ['', Validators.required],
      userType: ['', Validators.required],
      status: ['ACTIVE', Validators.required]
    });

    if (this.data?.name === 'edit-user' && this.data.id) {
      this.btnName = 'Update User';
      this.onEdit();
    }
  }

  createUser() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.toster.error('Please enter valid data!', 'Error');
      return;
    }

    const form = this.createForm.value;
    const now = new Date().toISOString();
    const obj = {
      // id: this.btnName === 'Update User' ? (this.data.id || 0) : 0,
      fullName: form.fullName,
      email: form.email.toLowerCase(),
      mobile: form.mobile,
      passwordHash: form.passwordHash,
      userType: form.userType,
      status: form.status,
      companyId: this.companyId,
      otp: 0,
      lastLoginAt: now,
      createdAt: now,
      updatedAt: now
    };

    this.isLoading = true;

    if (this.btnName === 'Create User') {
      this.service.createUser(obj).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.success) {
            this.toster.success(res.message || 'User created successfully', 'Success');
            this.onClose();
          } else {
            this.toster.error(res.message || 'Failed to create user', 'Error');
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.toster.error('Error creating user', 'Error');
        }
      });
    } else {
      this.service.updateUser(this.data.id, obj).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.success) {
            this.toster.success(res.message || 'User updated successfully', 'Success');
            this.onClose();
          } else {
            this.toster.error(res.message || 'Failed to update user', 'Error');
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.toster.error('Error updating user', 'Error');
        }
      });
    }
  }

  onEdit() {
    this.service.getUserById(this.data.id!).subscribe({
      next: (res: any) => {
        const user = res?.data || res;
        this.createForm.patchValue({
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          passwordHash: user.passwordHash,
          userType: user.userType,
          status: user.status
        });
      },
      error: (err: any) => console.log(err)
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
