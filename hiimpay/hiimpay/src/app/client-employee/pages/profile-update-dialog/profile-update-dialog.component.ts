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
  existingPasswordHash: string = '';
  formDataMatched: boolean = true;
  showPassword: boolean = false;
  disablePasswordEdit: boolean = false;
  staticPassword: string = 'Cpoc@1234';
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
    this.disablePasswordEdit = !!this.data?.disablePasswordEdit;
    this.staticPassword = this.data?.staticPassword || 'Cpoc@1234';

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
      mobile: parsedProfileInfo?.mobile || parsedProfileInfo?.contactNumber || '' ,
    };
    this.existingPasswordHash = (parsedProfileInfo?.passwordHash || '').toString();

    this.updateRecordsForm = this.fb.group({
      name: [this.profileInfo.name],
      workLocation: [this.profileInfo.workLocation],
      jobType: [this.profileInfo.jobType],
      departmentName: [this.profileInfo.departmentName],
      verified: [true],
      email: [
        this.profileInfo.email,
        [
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      mobile: [
        this.profileInfo.mobile,
        [Validators.pattern('^[6-9]\\d{9}$')],
      ],
      passwordHash: ['']
    });
    this.onFormChange();
    // set initial match state
    const initialKeys = ['name', 'workLocation', 'jobType', 'departmentName', 'email', 'mobile'];
    const initialFiltered: any = {};
    initialKeys.forEach((k) => (initialFiltered[k] = this.updateRecordsForm.get(k)?.value));
    this.formDataMatched = JSON.stringify(initialFiltered) === JSON.stringify(this.profileInfo);
  }

  onFormChange() {
    const keysToCompare = ['name', 'workLocation', 'jobType', 'departmentName', 'email', 'mobile'];
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
    const typedPassword = (vals.passwordHash ?? '').toString().trim();
    const finalObj: any = {
      name: (vals.name ?? this.profileInfo.name ?? '').toString().trim(),
      email: (vals.email ?? this.profileInfo.email ?? '').toString().trim(),
      mobile: (vals.mobile ?? this.profileInfo.mobile ?? '').toString().trim(),
      passwordHash: this.disablePasswordEdit
        ? this.staticPassword
        : (typedPassword || this.existingPasswordHash)
    };

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
