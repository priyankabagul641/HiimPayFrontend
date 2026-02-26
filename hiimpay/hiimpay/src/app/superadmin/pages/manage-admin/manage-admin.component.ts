import { Component, OnInit } from '@angular/core';

interface Admin {
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

@Component({
  selector: 'app-manage-admin',
  templateUrl: './manage-admin.component.html',
  styleUrls: ['./manage-admin.component.scss']
})
export class ManageAdminComponent implements OnInit {
  admins: Admin[] = [
    {
      name: 'Super Admin',
      email: 'admin@himpay.com',
      contact: '9999999999',
      address: 'Mumbai',
      active: true,
      permissions: {
        dashboard: true,
        brands: true,
        coupons: true,
        clients: true,
        employees: true,
        reports: true
      }
    },
    {
      name: 'Brand Manager',
      email: 'brand.manager@himpay.com',
      contact: '9876543210',
      address: 'Bengaluru',
      active: true,
      permissions: {
        dashboard: true,
        brands: true,
        coupons: true,
        clients: false,
        employees: false,
        reports: false
      }
    },
    {
      name: 'Ops Admin',
      email: 'ops.admin@himpay.com',
      contact: '9123456789',
      address: 'Hyderabad',
      active: false,
      permissions: {
        dashboard: true,
        brands: false,
        coupons: false,
        clients: true,
        employees: true,
        reports: true
      }
    }
  ];
  filteredAdmins: Admin[] = [];
  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  showCreatePopup = false;
  showAccessPopup = false;
  selectedAdmin!: Admin;

  newAdmin: Admin = this.getEmptyAdmin();

  ngOnInit(): void {
    this.applyFilters();
  }

  getEmptyAdmin(): Admin {
    return {
      name: '',
      email: '',
      contact: '',
      address: '',
      active: true,
      permissions: {
        dashboard: false,
        brands: false,
        coupons: false,
        clients: false,
        employees: false,
        reports: false
      }
    };
  }

  openCreateAdmin() {
    this.newAdmin = this.getEmptyAdmin();
    this.showCreatePopup = true;
  }

  createAdmin() {
    this.admins.push({ ...this.newAdmin });
    this.showCreatePopup = false;
    this.applyFilters();
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
