import { Component, OnInit } from '@angular/core';
import { AdminDataService } from '../../services/adminData.service';
import { ToastrService } from 'ngx-toastr';

interface Admin {
  id?: number;
  name: string;
  email: string;
  contact: string;
  address: string;
  active: boolean;
  permissions: {
    dashboard: boolean;
    brands: boolean;
    coupons: boolean;
    clients: boolean;
    employees: boolean;
    reports: boolean;
  };
}

interface NewAdmin {
  name: string;
  email: string;
  password: string;
  contact: string;
  address: string;
  active: boolean;
  permissions: {
    dashboard: boolean;
    brands: boolean;
    coupons: boolean;
    clients: boolean;
    employees: boolean;
    reports: boolean;
  };
}

@Component({
  selector: 'app-manage-admin',
  templateUrl: './manage-admin.component.html',
  styleUrls: ['./manage-admin.component.scss']
})
export class ManageAdminComponent implements OnInit {
  admins: Admin[] = [];
  filteredAdmins: Admin[] = [];
  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  isLoading = false;

  showCreatePopup = false;
  showAccessPopup = false;
  selectedAdmin!: Admin;

  newAdmin: NewAdmin = this.getEmptyAdmin();

  constructor(
    private adminService: AdminDataService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins() {
    this.isLoading = true;
    this.adminService.getAllAdmin().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.admins = (res?.data || []).map((u: any) => this.normalize(u));
        this.applyFilters();
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load admins');
      }
    });
  }

  private normalize(u: any): Admin {
    return {
      id:      u.id,
      name:    u.fullName || u.name || '-',
      email:   u.email || '-',
      contact: u.mobile  || u.contact || '-',
      address: u.address || '-',
      active:  (u.status || '').toUpperCase() === 'ACTIVE',
      permissions: {
        dashboard: false, brands: false, coupons: false,
        clients: false, employees: false, reports: false
      }
    };
  }

  getEmptyAdmin(): NewAdmin {
    return {
      name: '',
      email: '',
      password: '',
      contact: '',
      address: '',
      active: true,
      permissions: {
        dashboard: false, brands: false, coupons: false,
        clients: false, employees: false, reports: false
      }
    };
  }

  openCreateAdmin() {
    this.newAdmin = this.getEmptyAdmin();
    this.showCreatePopup = true;
  }

  createAdmin() {
    if (!this.newAdmin.name || !this.newAdmin.email || !this.newAdmin.password) {
      this.toastr.error('Name, email and password are required.');
      return;
    }
    const payload = {
      fullName:     this.newAdmin.name,
      email:        this.newAdmin.email,
      passwordHash: this.newAdmin.password,
      userType:     'ADMIN',
      status:       this.newAdmin.active ? 'ACTIVE' : 'INACTIVE'
    };
    this.adminService.createAdmin(payload).subscribe({
      next: (res: any) => {
        if (res?.success !== false) {
          this.toastr.success(res?.message || 'Admin created successfully.');
          this.showCreatePopup = false;
          this.loadAdmins();
        } else {
          this.toastr.error(res?.message || 'Failed to create admin.');
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || 'Failed to create admin.');
      }
    });
  }

  openAccessPopup(admin: Admin) {
    this.selectedAdmin = admin;
    this.showAccessPopup = true;
  }

  onFiltersChanged() {
    this.applyFilters();
  }

  getPermissionCount(admin: Admin): number {
    return Object.values(admin.permissions).filter(Boolean).length;
  }

  private applyFilters() {
    const keyword = (this.searchTerm || '').trim().toLowerCase();
    this.filteredAdmins = this.admins.filter((admin) => {
      const status = admin.active ? 'active' : 'inactive';
      const statusMatches = this.statusFilter === 'all' || this.statusFilter === status;
      if (!statusMatches) return false;

      if (!keyword) return true;
      const haystack = `${admin.name} ${admin.email} ${admin.contact} ${admin.address}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }
}
