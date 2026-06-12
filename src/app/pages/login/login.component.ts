import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  loginField = '';
  password = '';
  alertMsg: string | null = null;

  constructor() {
    if (this.auth.session()) {
      this.router.navigate(['/']);
    }
  }

  submit(form: NgForm): void {
    this.alertMsg = null;
    if (form.invalid) return;
    try {
      const user = this.auth.login(this.loginField, this.password);
      this.router.navigate([user.role === 'admin' ? '/admin' : '/']);
    } catch (err) {
      this.alertMsg = (err as Error).message;
    }
  }
}
