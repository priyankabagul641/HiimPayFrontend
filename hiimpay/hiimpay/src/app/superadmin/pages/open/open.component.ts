import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CreateclientComponent } from '../../createclient/createclient.component';
import { SearchService } from '../../services/search.service';
import { DeleteComponent } from '../delete/delete.component';
import { AdminDataService } from '../../services/adminData.service';

@Component({
  selector: 'app-open',
  templateUrl: './open.component.html',
  styleUrls: ['./open.component.css']
})
export class OpenComponent {
  data:any[]=[];
  filteredData: any[] = [];
  searchTerm = '';
  filterType: 'company' | 'pincode' = 'company';
  expandedRowIds: Record<string, boolean> = {};
  pinClients: any;
  newCount: any;
  allCount: any;
  orderBy:any = 'asc'; 
  page:any = 1;
  size:any = 10;
  sortBy:any = 'id';
  p: number = 1;
  itemPerPage: number = 9;
  totalItems: number = 10;

  constructor(private api:ApiService, private router:Router,private tosatr:ToastrService,private dialog:MatDialog,private service:SearchService, private touchService: AdminDataService){}

  isAdmin(): boolean {
    try {
      const raw = sessionStorage.getItem('currentLoggedInUserData');
      if (!raw) return false;
      const user = JSON.parse(raw);
      // support both legacy `typeOfUser` and new `userType` fields
      if (user.typeOfUser !== undefined) {
        return Number(user.typeOfUser) === 0;
      }
      if (user.userType) {
        return String(user.userType).toUpperCase() === 'ADMIN';
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  ngOnInit(): void {
  
    this.service.sendResults().subscribe({
      next: (res: any) => {
        const isArrayPayload = Array.isArray(res);
        const hasApiShape = !!res && typeof res === 'object' && 'success' in res;

        if (isArrayPayload && res.length === 0) {
          this.openClients();
        } else if (isArrayPayload) {
          this.applyClientData(res);
        } else if (hasApiShape) {
          if (res.success) {
            this.applyClientData(res.data || []);
          } else {
            this.applyClientData([]);
          }
        } else {
          this.openClients();
        }
      },
      error: (_err: any) => {
        this.openClients();
      },
      complete: () => {},
    });

    // this.pinnedClients();

    // Static counts used by the template (remove dynamic integration)
    this.allCount = 20;
    this.newCount = 5;
  }


  openClients(){
    this.touchService.getAllCompanies().subscribe((res: any) => {
      if (!res) {
        this.applyClientData([]);
        return;
      }

      // API returns { data: [...] , success: true } or sometimes direct array
      if (res.success && Array.isArray(res.data)) {
        this.applyClientData(res.data);
      } else if (Array.isArray(res)) {
        this.applyClientData(res);
      } else if (Array.isArray(res.data)) {
        this.applyClientData(res.data);
      } else {
        this.applyClientData([]);
      }
    }, (_err:any) => {
      this.applyClientData([]);
    });
  }

  setClientId(event: MouseEvent, id: any) {
    event.stopPropagation();
    this.router.navigate(['superadmin/project/', id, 'project-admin']);
  }

  pageChangeEvent(event: number) {
    this.p = event;
  }

  openMenu(event: MouseEvent) {
    event.stopPropagation(); 
}

editClient(clientId:any) {
    const dialogRef = this.dialog.open(CreateclientComponent, {
      width: '700px',
      height: '550px',
      disableClose: true,
      data: { name: 'create-project', companyId: clientId, isCompany: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // refresh the list after a successful create/update from the dialog
        this.openClients();
      }
    });
}

// deleteClient(clientId:any) {
//   this.api.deleteClient(clientId).subscribe((res:any)=>{
//     if(res.success){
//       this.tosatr.success(res.message);
//       window.location.reload();
//     }
//   })
// }
deleteClient(client: any) {
  const dialogRef = this.dialog.open(DeleteComponent, {
    data: {
      message: `Do you really want to delete the records for ${client.clientName} ?`,
    },
    disableClose:true
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result.action == 'ok') {
      this.api.deleteClient(client.id).subscribe((res:any)=>{
        if(res.success){
          this.tosatr.success(res.message);
          window.location.reload();
        }
      })
    }
  });
}


  
  relativePercentage(statusCount: any) {
    if (!this.allCount || this.allCount === 0) return 0;
    return (statusCount / this.allCount) * 100;
  }

  applyClientData(rows: any[]) {
    this.data = Array.isArray(rows) ? rows : [];
    this.onFiltersChanged();
  }

  onFiltersChanged() {
    const term = (this.searchTerm || '').trim().toLowerCase();
    const byPincode = this.filterType === 'pincode';

    this.filteredData = this.data.filter((item: any) => {
      if (!term) return true;
      const company = (item.companyName || item.clientName || '').toString().toLowerCase();
      const pincode = (item.pincode || '').toString().toLowerCase();
      return byPincode ? pincode.includes(term) : company.includes(term);
    });

    this.totalItems = this.filteredData.length;
    this.p = 1;
    this.expandedRowIds = {};
  }

  toggleExpanded(id: any) {
    const key = String(id);
    this.expandedRowIds[key] = !this.expandedRowIds[key];
  }

  isExpanded(id: any): boolean {
    return !!this.expandedRowIds[String(id)];
  }

  getPageUpperBound(): number {
    const upper = this.p * this.itemPerPage;
    return Math.min(upper, this.totalItems);
  }
  
 
}
