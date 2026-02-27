import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/companyService';
import { ToastrService } from 'ngx-toastr';
import { CreateUserComponent } from './create-user/create-user.component';
import { jsPDF } from "jspdf";

@Component({
  selector: 'app-project-admin',
  templateUrl: './project-admin.component.html',
  styleUrl: './project-admin.component.css',
})
export class ProjectAdminComponent implements OnInit {
  filterToggle: boolean = false;
  details: any[] = [];
  info: any;
  file: any;
  page: any = 1;
  size: any = 10;
  itemPerPage: number = 10;
  totalItems: number = 0;
  isSelectedFileValid: boolean = false;
  checkDownloadExcelSpinner: boolean = false;
  checkuploadExcelSpinner: boolean = false;
  displayClientData: any;
  companyId: number = 0;
  companyName: string = '';

  isLoading: boolean = true;
  constructor(
    public dialog: MatDialog,
    private service: ProjectService,
    private toaster: ToastrService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    // Read the company id from the parent route param (:id in superadmin/project/:id)
    const routeId = this.route.snapshot.parent?.params['id'] ||
                    this.route.snapshot.params['id'];
    if (routeId) {
      this.companyId = Number(routeId);
      sessionStorage.setItem('ClientId', routeId);
    } else {
      // fallback: use ClientId already stored in session
      const stored = sessionStorage.getItem('ClientId');
      this.companyId = stored ? Number(stored) : 0;
    }
    this.getAllUsers();
    this.getCompanyName();
  }

  getCompanyName() {
    this.service.CompanyDATA(this.companyId).subscribe({
      next: (res: any) => {
        this.companyName = res?.data?.companyName || '';
      },
      error: (err: any) => console.log(err)
    });
  }

  getAllUsers() {
    this.isLoading = true;
    this.service.clientByCompanyID(this.companyId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.details = res.data || [];
        this.totalItems = this.details.length;
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      }
    });
  }

  pageChangeEvent(event: number) {
    this.page = event;
    this.getAllUsers();
  }

  // onclick(id: any) {
  //   console.log(id);

  //   this.service.getByUserID(id).subscribe((res: any) => {
  //     // console.log(res);
  //     this.info = res;
  //     // console.log(this.info);
  //   });
  // }
  openPopup(): void {
    const dialogRef = this.dialog.open(CreateUserComponent, {
      width: '700px',
      disableClose: true,
      data: { name: 'Create User', companyId: this.companyId },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getAllUsers();
    });
  }

  editUser(userId: number) {
    const dialogRef = this.dialog.open(CreateUserComponent, {
      width: '700px',
      disableClose: true,
      data: { name: 'edit-user', id: userId, companyId: this.companyId },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getAllUsers();
    });
  }

  activeDeactiveUser(user: any) {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const obj = { status: newStatus };

    this.service.deleteUserByID(user.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toaster.success(
            newStatus === 'ACTIVE' ? 'User activated successfully' : 'User deactivated successfully',
            'Success'
          );
          this.getAllUsers();
        }
      },
      error: (err) => console.log(err)
    });
  }


  itemsCard: any[] = [];

  validateFile() {
    if (
      ![
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ].includes(this.file.type)
    ) {
      this.isSelectedFileValid = false;
    } else {
      this.isSelectedFileValid = true;
    }
  }

  getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  generateErrorPdf(errors: string[]) {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Bulk upload errors :: Date - " + this.getCurrentDate(), 10, 10);


    let yPos = 20;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 10;

    errors.forEach((error, index) => {
      if (yPos + lineHeight > pageHeight - 10) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(error, 10, yPos);
      yPos += lineHeight;
    });

    doc.save("upload_errors.pdf");
  }


  uploadFile() {
    // Excel bulk upload not yet supported for this API
    this.toaster.info('Bulk upload not available', 'Info');
  }

  onFileBrowse(event: any) {
    const inputElement = event.target as HTMLInputElement;
    this.file = inputElement?.files?.[0];
    if (this.file) {
      this.validateFile();
      inputElement.value = '';
    }
  }


  downloadExcelFormat() {
    this.checkDownloadExcelSpinner = true;

    this.service.getExcelFileUrl().subscribe((response: any) => {
      if (response?.url) {
        this.service.downloadExcelFile(response.url).subscribe((blob: any) => {
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = 'userUploadFormat.xlsx';
          a.click();
          URL.revokeObjectURL(objectUrl);
        }, (error: any) => {
          console.error('Download error:', error);
        });
      } else {
        console.error('Invalid response from API');
      }
      this.checkDownloadExcelSpinner = false;
    }, (error: any) => {
      console.error('Error fetching Excel URL:', error);
      this.checkDownloadExcelSpinner = false;
    });
  }

}
