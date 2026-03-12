import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminDataService } from '../../../services/adminData.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-manualbrand',
  templateUrl: './manualbrand.component.html',
  styleUrls: ['./manualbrand.component.css']
})
export class ManualbrandComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  brandImagePreview: string | ArrayBuffer | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ManualbrandComponent>,
    private adminService: AdminDataService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      brandName: ['', Validators.required],
      brandProductCode: ['', Validators.required],
      brandType: ['', Validators.required],
      // onboardingType is fixed to 'Manual' server-side
      redemptionType: ['ONLINE', Validators.required],
      onlineRedemptionUrl: [''],
      brandImage: [''],
      epayMinValue: [0, [Validators.min(0)]],
      epayMaxValue: [0, [Validators.min(0)]],
      epayDiscount: [0, [Validators.min(0)]],
      serviceType: [''],
      stockAvailable: [true],
      description: [''],
      tnc: [''],
      importantInstruction: ['']
    }, { validators: this.validateMinMax.bind(this) });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const f = this.form.value;
    const timestamp = Date.now();
    const skuGenerated = `sku01`;
    const generatedBrandSku = `${skuGenerated}-${timestamp}`;

    const payload = {
     
      brandName: f.brandName,
      brandProductCode: f.brandProductCode,
      brandSku: generatedBrandSku,
      sku: skuGenerated,
      brandType: f.brandType,
      onboardingType: 'Manual',
      redemptionType: f.redemptionType,
      onlineRedemptionUrl: f.onlineRedemptionUrl,
      brandImage: f.brandImage,
      epayMinValue: f.epayMinValue,
      epayMaxValue: f.epayMaxValue,
      epayDiscount: f.epayDiscount,
      serviceType: f.serviceType,
      stockAvailable: f.stockAvailable,
      description: f.description,
      tnc: f.tnc,
      importantInstruction: f.importantInstruction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      deletedAt: null
    };

    // additional client-side check for min/max
    const min = Number(this.form.get('epayMinValue')?.value || 0);
    const max = Number(this.form.get('epayMaxValue')?.value || 0);
    if (min < 0 || max < 0) {
      this.toastr.error('Values cannot be negative');
      return;
    }
    if (max < min) {
      this.toastr.error('Epay Max Value should be greater than or equal to Min Value');
      return;
    }

    this.isLoading = true;
    this.adminService.createBrand(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.success === false && res.message === 'Brand name already exists') {
          this.toastr.error('Brand name is exist');
          return;
        }
        this.toastr.success(res?.message || 'Brand created successfully');
        this.form.reset();
        this.brandImagePreview = null;
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.isLoading = false;
        const msg = err?.error?.message || err?.message || 'Failed to create brand';
        if (msg === 'Brand name already exists') {
          this.toastr.error('Brand name is exist');
        } else {
          this.toastr.error(msg);
        }
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.brandImagePreview = reader.result;
      // set base64 data to form control (server may accept URL or base64)
      this.form.patchValue({ brandImage: reader.result });
    };
    reader.readAsDataURL(file);
  }

  removeSelectedImage() {
    this.brandImagePreview = null;
    this.form.patchValue({ brandImage: '' });
    try {
      if (this.fileInput && this.fileInput.nativeElement) {
        this.fileInput.nativeElement.value = '';
      }
    } catch (e) {
      // ignore
    }
  }

  validateMinMax(group: FormGroup) {
    const minCtrl = group.get('epayMinValue');
    const maxCtrl = group.get('epayMaxValue');
    if (!minCtrl || !maxCtrl) return null;
    const min = Number(minCtrl.value) || 0;
    const max = Number(maxCtrl.value) || 0;
    if (max < min) {
      const errors = { ...(maxCtrl.errors || {}), maxLessThanMin: true };
      maxCtrl.setErrors(errors);
      return { maxLessThanMin: true };
    } else {
      if (maxCtrl.errors) {
        const errs = { ...(maxCtrl.errors || {}) };
        delete errs['maxLessThanMin'];
        const hasOther = Object.keys(errs).length > 0;
        maxCtrl.setErrors(hasOther ? errs : null);
      }
      return null;
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }

  getControl(name: string) {
    return this.form.get(name);
  }

}
