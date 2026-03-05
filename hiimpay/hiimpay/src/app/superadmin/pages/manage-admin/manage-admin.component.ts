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
  showEditPopup = false;
  selectedAdmin!: Admin;
  editingAdmin: { id?: number; name: string; email: string; password: string; contact: string; address: string; active: boolean } = this.getEmptyEditAdmin();

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

  // Validation helper methods
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[0-9]{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  getPasswordStrength(password: string): string {
    if (!password) return '';
    if (password.length < 8) return 'weak';
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) return 'strong';
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 'medium';
    return 'weak';
  }

  createAdmin() {
    // Validate required fields
    if (!this.newAdmin.name || !this.newAdmin.email || !this.newAdmin.password) {
      this.toastr.error('Name, email and password are required.');
      return;
    }

    // Validate email format
    if (!this.isValidEmail(this.newAdmin.email)) {
      this.toastr.error('Please enter a valid email address.');
      return;
    }

    // Validate phone number if provided
    if (this.newAdmin.contact && !this.isValidPhoneNumber(this.newAdmin.contact)) {
      this.toastr.error('Phone number must be at least 10 digits.');
      return;
    }

    // Validate password strength
    if (!this.isValidPassword(this.newAdmin.password)) {
      this.toastr.error('Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&).');
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
    
    // Load permissions from API
    if (admin.id) {
      this.adminService.getManageAdminAcess(admin.id).subscribe({
        next: (res: any) => {
          const permissionKeys = res?.data || [];
          // Map permission keys to the permissions object
          this.selectedAdmin.permissions = {
            dashboard: permissionKeys.includes('dashboard'),
            brands: permissionKeys.includes('brands'),
            coupons: permissionKeys.includes('coupons'),
            clients: permissionKeys.includes('clients'),
            employees: permissionKeys.includes('employees'),
            reports: permissionKeys.includes('reports')
          };
        },
        error: (err: any) => {
          console.error('Failed to load permissions:', err);
        }
      });
    }
    
    this.showAccessPopup = true;
  }

  saveAccessPermissions() {
    if (!this.selectedAdmin || !this.selectedAdmin.id) {
      this.toastr.error('Admin not selected.');
      return;
    }
    const permissionKeys = Object.keys(this.selectedAdmin.permissions).filter(
      (key) => this.selectedAdmin.permissions[key as keyof Admin['permissions']]
    );
    const payload = { permissionKeys };
    this.adminService.updateManageAdminAcess(this.selectedAdmin.id, payload).subscribe({
      next: (res: any) => {
        if (res?.success !== false) {
          this.toastr.success(res?.message || 'Permissions updated successfully.');
          this.showAccessPopup = false;
          this.loadAdmins();
        } else {
          this.toastr.error(res?.message || 'Failed to update permissions.');
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || 'Failed to update permissions.');
      }
    });
  }

  getEmptyEditAdmin() {
    return { id: undefined as number | undefined, name: '', email: '', password: '', contact: '', address: '', active: true };
  }

  openEditAdmin(admin: Admin) {
    this.editingAdmin = {
      id:      admin.id,
      name:    admin.name,
      email:   admin.email,
      password: '',
      contact: admin.contact,
      address: admin.address,
      active:  admin.active
    };
    this.selectedAdmin = admin;

    // Load permissions from API
    if (admin.id) {
      this.adminService.getManageAdminAcess(admin.id).subscribe({
        next: (res: any) => {
          const permissionKeys = res?.data || [];
          // Map permission keys to the permissions object
          this.selectedAdmin.permissions = {
            dashboard: permissionKeys.includes('dashboard'),
            brands: permissionKeys.includes('brands'),
            coupons: permissionKeys.includes('coupons'),
            clients: permissionKeys.includes('clients'),
            employees: permissionKeys.includes('employees'),
            reports: permissionKeys.includes('reports')
          };
        },
        error: (err: any) => {
          console.error('Failed to load permissions:', err);
        }
      });
    }

    this.showEditPopup = true;
  }

  saveEditAdmin() {
    if (!this.editingAdmin.name || !this.editingAdmin.email) {
      this.toastr.error('Name and email are required.');
      return;
    }
    const payload: any = {
      fullName:  this.editingAdmin.name,
      email:     this.editingAdmin.email,
      userType:  'ADMIN',
      status:    this.editingAdmin.active ? 'ACTIVE' : 'INACTIVE'
    };
    if (this.editingAdmin.password) {
      payload['passwordHash'] = this.editingAdmin.password;
    }
    this.adminService.updateAdmin(payload, this.editingAdmin.id).subscribe({
      next: (res: any) => {
        if (res?.success !== false) {
          this.toastr.success(res?.message || 'Admin updated successfully.');
          this.showEditPopup = false;
          this.loadAdmins();
        } else {
          this.toastr.error(res?.message || 'Failed to update admin.');
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || 'Failed to update admin.');
      }
    });
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
