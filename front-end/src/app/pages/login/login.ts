import { Component, signal } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';

@Component({
  selector: 'app-login',
  imports: [
    ...SHARED_IMPORTS,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  view = signal<'login' | 'register' | 'forgot'>('login');
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  get isFormValid(): boolean {
    return this.email.trim().length > 0 && this.password.trim().length > 0;
  }

  get isRegisterValid(): boolean {
    return this.name.trim().length > 0
      && this.email.trim().length > 0
      && this.password.trim().length >= 6
      && this.password === this.confirmPassword;
  }

  get isForgotValid(): boolean {
    return this.email.trim().length > 0;
  }

  showLogin(): void {
    this.view.set('login');
  }

  showRegister(): void {
    this.view.set('register');
  }

  showForgot(): void {
    this.view.set('forgot');
  }
}
