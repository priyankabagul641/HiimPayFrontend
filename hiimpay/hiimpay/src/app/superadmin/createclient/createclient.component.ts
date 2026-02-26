import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { AdminDataService } from '../services/adminData.service';

@Component({
  selector: 'app-createclient',
  templateUrl: './createclient.component.html',
  styleUrl: './createclient.component.css'
})
export class CreateclientComponent {
  showcontainer: string = '';
  clientId: any;
  createForm!: FormGroup;
  buttonName: any = 'Create'
  consultants:any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
   private dialogRef: MatDialogRef<CreateclientComponent>, 
   private fb: FormBuilder, private api: ApiService, private toastr: ToastrService,
    private touchService: AdminDataService) {
    if (data.name !== null) {
      this.showcontainer = data.name;
      if (data.clientId > 0) {
        this.clientId = data.clientId;
        console.log(this.clientId);
      }
      // support company editing: data.companyId
      if (data.companyId > 0) {
        this.clientId = data.companyId;
        console.log('company edit id', this.clientId);
      }
    }
  }

  ngOnInit() {
    this.api.getCousultants().subscribe((res:any)=>{console.log(res);
      this.consultants=res.data
    })
    this.createForm = this.fb.group({
      client_Name: ['', Validators.required],
      contact_Person: ['', Validators.required],
      contact_Email: ['', [Validators.required,Validators.pattern(new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$', 'i'))]],
      second_Contact_Email: ['', [Validators.pattern(new RegExp('^$|^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$', 'i'))]],
      // Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]
      mobile_Number1: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]],
      mobile_Number2: ['', [Validators.pattern('^$|^[6-9]\\d{9}$')]],
      landline_Number: ['', [Validators.pattern('^$|^\\d{6,15}$')]],
      industry: ['',Validators.required],
      location: [''],
      loggedUserId: '',
      status:[''],
      consultantId:['']
    });
    if (this.clientId > 0) {
      this.buttonName = 'Update'
      // decide whether this is a client edit or a company edit
      if (this.data && this.data.isCompany) {
        this.getCompanyById();
      } else {
        this.getClientById();
      }
    }
  }

  createProject() {
    if (this.buttonName === 'Create') {
      if (this.createForm.valid) {
        const form = this.createForm.value;
        const obj = {
        
            companyName: form.client_Name,
            industry: form.industry,
            contactName: form.contact_Person,
            contactEmail: form.contact_Email,
            contactMobile: form.mobile_Number1,
            status: form.status || 'Active',
            consultingPhase: form.location || '',
            isSharedJourneyMap: true,
            isSharedFeedback: true
          };

        console.log(obj);
        this.touchService.createCompany(obj).subscribe((res) => {
          if (res.success && res.message==='Client registered successfully...!!') {
            this.toastr.success(res.message);
            this.createForm.reset();
            this.onClose(true);
          }
          else if(res.message==='Mobile number is already registered.'){
            this.toastr.error(res.message);
          }
          else if(res.message==='Email number is already registered.'){
            this.toastr.error('Email ID is already registered.');
          }
        })
      }
      else {
        this.createForm.markAllAsTouched();
        this.toastr.error('Please enter valid details');
      }
    }
    else if(this.buttonName==='Update'){
      if(this.createForm.valid){
        const form = this.createForm.value;
        // If editing a company, call company update endpoint with mapped payload
        if (this.data && this.data.isCompany) {
          const payload = {
            id: this.clientId,
            companyName: form.client_Name,
            industry: form.industry,
            contactName: form.contact_Person,
            contactEmail: form.contact_Email,
            contactMobile: form.mobile_Number1,
            status: form.status || 'Active',
            consultingPhase: form.location || '',
            isSharedJourneyMap: true,
            isSharedFeedback: true
          };

          this.touchService.updateComponany(this.clientId, payload).subscribe((res) => {
            if (res && res.success) {
              this.toastr.success(res.message || 'Company updated successfully');
              this.createForm.reset();
              this.onClose(true);
            } else {
              this.toastr.error(res?.message || 'Failed to update company');
            }
          }, (err) => {
            this.toastr.error('Failed to update company');
          });
        } else {
          const obj = {
            client_Name: form.client_Name,
            contact_Person: form.contact_Person,
            contact_Email: form.contact_Email,
            contact_Phone: form.mobile_Number1,
            mobile_Number1: form.mobile_Number1,
            mobile_Number2: form.mobile_Number2,
            landline_Number: form.landline_Number,
            second_Contact_Email: form.second_Contact_Email,
            industry: form.industry,
            location: form.location,
            loggedUserId: JSON.parse(sessionStorage.getItem("currentLoggedInUserData")!).id,
            id:this.clientId,
            status:form.status,
            consultantId:form.consultantId,
          }

          console.log(obj);
          this.api.updateClientById(this.clientId,obj).subscribe((res)=>{
            if(res.success && res.message==='Client updated successfully.'){
              console.log(res)
              this.toastr.success(res.message);
              this.createForm.reset();
              this.onClose(true);
            }
            else if(res.message==='Mobile number is already registered.'){
              this.toastr.error(res.message);
            }
            else if(res.message==='Email Id is already registered'){
              this.toastr.error('Email ID is already registered.');
            }
          })
        }
      }
    }
  }



  getClientById() {
    this.api.getClientById(this.clientId).subscribe((res) => {
      if (res.success) {
        const clientData = res.data;
        const selectedConsultant = this.consultants.find((consultant: any) => consultant.id === clientData.consultantId);
        console.log('Selected Consultant:', selectedConsultant);
        
        console.log(res.data)
        this.createForm.patchValue({
          id:this.clientId,
          client_Name: clientData.clientName,
          contact_Person: clientData.contactPerson,
          contact_Email: clientData.contactEmail,
          second_Contact_Email:
            clientData.second_Contact_Email ??
            clientData.secondContactEmail ??
            clientData.contactEmail2 ??
            clientData.secondaryEmail ??
            '',
          mobile_Number1: clientData.mobileNumber1 ?? clientData.mobile_Number1 ?? clientData.contactPhone ?? '',
          mobile_Number2: clientData.mobileNumber2 ?? clientData.mobile_Number2 ?? '',
          landline_Number: clientData.landlineNumber ?? clientData.landline_Number ?? '',
          industry: clientData.industry,
          location: clientData.location,
          status: clientData.status,
       consultantId: selectedConsultant ? selectedConsultant.id : ''
        });
      }
    });
  }

  getCompanyById() {
    // adminData.service provides getAllCompanies() so fetch and find by id
    this.touchService.getAllCompanies().subscribe((res: any) => {
      const list = res?.data || [];
      const company = list.find((c: any) => Number(c.id) === Number(this.clientId));
      if (company) {
        this.createForm.patchValue({
          id: this.clientId,
          client_Name: company.companyName || '',
          contact_Person: company.contactName || '',
          contact_Email: company.contactEmail || '',
          second_Contact_Email: company.secondContactEmail || '',
          mobile_Number1: company.contactMobile || '',
          mobile_Number2: '',
          landline_Number: '',
          industry: company.industry || '',
          location: company.consultingPhase || '',
          status: company.status || 'ACTIVE',
          consultantId: ''
        });
      }
    });
  }

  onUpdate(){

  }

  onClose(result?: any): void {
    this.dialogRef.close(result);
  }


  isNumber(evt: any) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
