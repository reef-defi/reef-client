import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationComponent } from '../../shared/components/notification/notification.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private readonly snackBar: MatSnackBar) {
  }

  public showNotification(message: string, buttonText: string, type: 'error' | 'success' | 'info'): void {
    console.log(message, 'DEBUG_ERROR')
    this.snackBar.openFromComponent<NotificationComponent>(NotificationComponent, {
      data: {
        message,
        buttonText,
        type,
      },
      panelClass: type,
    });
  }
}
