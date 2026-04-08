import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-public-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class PublicProfileComponent implements OnInit {
  activeTab = 'profile';
  tabs = [
    { id: 'profile', label: 'My Profile' },
    { id: 'transactions', label: 'My Transactions' },
    { id: 'epay', label: 'e-Pay Transactions' },
    { id: 'autopay', label: 'AutoPay' },
    { id: 'helpdesk', label: 'Helpdesk' }
  ];

  profile = {
    name: '---',
    mobile: '---',
    email: '---',
    state: '---',
    city: '---',
    dob: '---',
    password: '********'
  };

  isEditing = false;
  editForm = { ...this.profile };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    try {
      const saved = localStorage.getItem('publicUserProfile');
      if (saved) {
        this.profile = { ...this.profile, ...JSON.parse(saved) };
        this.editForm = { ...this.profile };
      }
    } catch {}
  }

  saveProfile(): void {
    this.profile = { ...this.editForm };
    try {
      localStorage.setItem('publicUserProfile', JSON.stringify(this.profile));
    } catch {}
    this.isEditing = false;
  }

  startEdit(): void {
    this.editForm = { ...this.profile };
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  goBack(): void {
    this.router.navigate(['/store']);
  }
}
