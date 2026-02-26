import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-client-info-dialog',
  templateUrl: './client-info-dialog.component.html',
  styleUrls: ['./client-info-dialog.component.css']
})
export class ClientInfoDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ClientInfoDialogComponent>
  ) {}

  close() {
    this.dialogRef.close();
  }
}
