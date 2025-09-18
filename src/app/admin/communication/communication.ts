import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="section-header">
      <h2>Communication</h2>
      <div>
        <button class="create-btn" (click)="toggleMailForm()">Send Mail</button>
        <button class="create-btn" (click)="toggleSMSForm()">Send SMS</button>
      </div>
    </div>

    <div *ngIf="showMailForm()" class="form-container">
      <h3>Send Custom Mail</h3>
      <form (ngSubmit)="onSendMail()">
        <input [(ngModel)]="mailForm().to" name="to" placeholder="To Email" required>
        <input [(ngModel)]="mailForm().subject" name="subject" placeholder="Subject" required>
        <textarea [(ngModel)]="mailForm().body" name="body" placeholder="Message Body" required></textarea>
        <div class="form-actions">
          <button type="submit">Send Mail</button>
          <button type="button" (click)="toggleMailForm()">Cancel</button>
        </div>
      </form>
    </div>

    <div *ngIf="showSMSForm()" class="form-container">
      <h3>Send Custom SMS</h3>
      <form (ngSubmit)="onSendSMS()">
        <input [(ngModel)]="smsForm().to" name="to" placeholder="Phone Number" required>
        <textarea [(ngModel)]="smsForm().message" name="message" placeholder="SMS Message" required></textarea>
        <div class="form-actions">
          <button type="submit">Send SMS</button>
          <button type="button" (click)="toggleSMSForm()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .create-btn { background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px; }
    .form-container { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .form-container form { display: grid; gap: 15px; }
    .form-container input, .form-container textarea { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
    .form-container textarea { min-height: 80px; resize: vertical; }
    .form-actions { display: flex; gap: 10px; }
    .form-actions button { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    .form-actions button[type="submit"] { background: #007bff; color: white; }
    .form-actions button[type="button"] { background: #6c757d; color: white; }
  `]
})
export class CommunicationComponent {
  sendMail = output<any>();
  sendSMS = output<any>();

  showMailForm = signal(false);
  showSMSForm = signal(false);
  mailForm = signal({ to: '', subject: '', body: '' });
  smsForm = signal({ to: '', message: '' });

  toggleMailForm() {
    this.showMailForm.set(!this.showMailForm());
  }

  toggleSMSForm() {
    this.showSMSForm.set(!this.showSMSForm());
  }

  onSendMail() {
    this.sendMail.emit(this.mailForm());
    this.showMailForm.set(false);
    this.resetMailForm();
  }

  onSendSMS() {
    this.sendSMS.emit(this.smsForm());
    this.showSMSForm.set(false);
    this.resetSMSForm();
  }

  resetMailForm() {
    this.mailForm.set({ to: '', subject: '', body: '' });
  }

  resetSMSForm() {
    this.smsForm.set({ to: '', message: '' });
  }
}