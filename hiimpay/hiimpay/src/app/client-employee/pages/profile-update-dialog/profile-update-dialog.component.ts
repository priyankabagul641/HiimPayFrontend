import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../service/employee.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-update-dialog',
  templateUrl: './profile-update-dialog.component.html',
  styleUrl: './profile-update-dialog.component.css',
})
export class ProfileUpdateDialogComponent implements OnInit {
  updateRecordsForm!: FormGroup;
  profileInfo: any;
  formDataMatched: boolean = true;
  showPassword: boolean = false;
  isLoading: boolean = false;
  userId: number | null = null;

  departmentOptions: string[] = [
    'Compliance and legal',
    'External Communications',
    'Facilities Management',
    'Finance',
    'HR Shared Services',
    'HR',
    'Internal Communications',
    'IT',
    'Learning & Development',
    'Operations',
    'Procurement',
    'Security',
    'Other'
  ];
  

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ProfileUpdateDialogComponent>,
    private fb: FormBuilder,
    private service: EmployeeService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // let parsedProfileInfo : any;
    // let id = JSON.parse(sessionStorage.getItem('currentLoggedInUserData')!).id;
    // this.service.getUserById(id).subscribe({next:(res:any)=>{
    //   parsedProfileInfo = res;
    // },error:(err)=>{console.log(err)},complete:()=>{}})
    const stored = sessionStorage.getItem('currentLoggedInUserData');
    let parsedProfileInfo = this.data?.profile || (stored ? JSON.parse(stored) : null);

    // If session data missing -> redirect to login
    if (!parsedProfileInfo) {
      try { this.dialogRef.close(); } catch (e) {}
      sessionStorage.clear();
      this.toastr.info('Session expired. Redirecting to login.');
      this.router.navigate(['/auth/userlogin']);
      return;
    }

    // If admin user is deleted or marked inactive, clear session and redirect
    if ((parsedProfileInfo?.userType === 'ADMIN') && (parsedProfileInfo?.isDeleted === true || (parsedProfileInfo?.status && parsedProfileInfo.status !== 'ACTIVE'))) {
      try { this.dialogRef.close(); } catch (e) {}
      sessionStorage.clear();
      this.toastr.info('Admin access removed. Redirecting to login.');
      this.router.navigate(['/auth/userlogin']);
      return;
    }

    this.userId = parsedProfileInfo?.id ?? null;

    this.profileInfo = {
      name: parsedProfileInfo?.fullName || parsedProfileInfo?.name || '',
      workLocation: parsedProfileInfo?.workLocation || '',
      jobType: parsedProfileInfo?.jobType || '',
      departmentName: parsedProfileInfo?.departmentName || '',
      email: parsedProfileInfo?.email || parsedProfileInfo?.userEmail || '',
      contactNumber: parsedProfileInfo?.mobile || parsedProfileInfo?.contactNumber || '' ,
    };

    this.updateRecordsForm = this.fb.group({
      name: [this.profileInfo.name, [Validators.required]],
      workLocation: [this.profileInfo.workLocation],
      jobType: [this.profileInfo.jobType],
      departmentName: [this.profileInfo.departmentName],
      verified: [true],
      email: [
        this.profileInfo.email,
        [
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      contactNumber: [
        this.profileInfo.contactNumber,
        [Validators.required, Validators.pattern('^[6-9]\\d{9}$')],
      ],
      password: ['']
    });
    this.onFormChange();
    // set initial match state
    const initialKeys = ['name', 'workLocation', 'jobType', 'departmentName', 'email', 'contactNumber'];
    const initialFiltered: any = {};
    initialKeys.forEach((k) => (initialFiltered[k] = this.updateRecordsForm.get(k)?.value));
    this.formDataMatched = JSON.stringify(initialFiltered) === JSON.stringify(this.profileInfo);
  }

  onFormChange() {
    const keysToCompare = ['name', 'workLocation', 'jobType', 'departmentName', 'email', 'contactNumber'];
    this.updateRecordsForm.valueChanges.subscribe((val) => {
      const filtered: any = {};
      keysToCompare.forEach((k) => (filtered[k] = val[k]));
      this.formDataMatched = JSON.stringify(filtered) === JSON.stringify(this.profileInfo);
    });
  }

  onNoClick() {
    this.dialogRef.close({ action: 'no' });
    this.updateRecordsForm.reset();
  }

  onSubmit() {
    const id = this.userId;
    if (!id) {
      this.toastr.error('User ID not found. Please refresh and try again.');
      return;
    }
    const vals = this.updateRecordsForm.value;
    let finalObj: any = {};
    if (vals.name !== this.profileInfo.name) finalObj.fullName = vals.name;
    if (vals.email !== this.profileInfo.email) finalObj.email = vals.email;
    if (vals.contactNumber !== this.profileInfo.contactNumber) finalObj.mobile = vals.contactNumber;
    if (vals.password && vals.password.trim().length > 0) finalObj.passwordHash = vals.password;

    // if nothing changed, still send editable fields so API is called
    if (Object.keys(finalObj).length === 0) {
      finalObj = { fullName: vals.name, email: vals.email, mobile: vals.contactNumber };
      if (vals.password && vals.password.trim().length > 0) finalObj.passwordHash = vals.password;
    }

    console.log('Profile update payload:', finalObj);
    this.isLoading = true;
    this.toastr.info('Updating profile...', '');

    this.service.updateUser(id, finalObj).subscribe({
      next: (val: any) => {
        this.isLoading = false;
        sessionStorage.setItem('currentLoggedInUserData', JSON.stringify(val.data));
        this.toastr.success('Profile updated successfully');
        this.dialogRef.close({ action: 'ok' });
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Profile update error:', err);
        this.toastr.error(err?.error?.message || 'Something went wrong. Please try again');
      },
    });
  }
}
