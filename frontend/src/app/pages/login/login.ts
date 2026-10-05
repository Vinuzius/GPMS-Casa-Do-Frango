import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../shared/services/auth.service';

type LoginView = 'login' | 'request' | 'code';

function traduzirErro(mensagem: string): string {
  if (mensagem === 'Invalid login credentials') {
    return 'E-mail ou senha inválidos.';
  }
  if (mensagem === 'Email not confirmed') {
    return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
  }
  return 'Não foi possível entrar. Tente novamente.';
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);

  readonly view = signal<LoginView>('login');
  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });
  readonly recoveryForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  readonly codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  readonly enviando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly aviso = signal<string | null>(null);
  private recoveryCode = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, senha } = this.form.getRawValue();
    this.enviando.set(true);
    this.erro.set(null);

    const { error } = await this.authService.signIn(email!, senha!);

    this.enviando.set(false);

    if (error) {
      this.erro.set(traduzirErro(error.message));
      return;
    }

    this.router.navigateByUrl('/dashboard');
  }

  showRecovery(): void {
    this.view.set('request');
    this.erro.set(null);
    this.aviso.set(null);
    this.recoveryForm.reset();
  }

  backToLogin(): void {
    this.view.set('login');
    this.erro.set(null);
    this.aviso.set(null);
  }

  sendRecoveryCode(): void {
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      return;
    }

    this.recoveryCode = '123456';
    this.view.set('code');
    this.erro.set(null);
    this.codeForm.reset();
  }

  resetPassword(): void {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }

    const { code, newPassword, confirmPassword } = this.codeForm.getRawValue();
    if (code !== this.recoveryCode) {
      this.erro.set('Código inválido. Use o código enviado para o seu e-mail.');
      return;
    }
    if (newPassword !== confirmPassword) {
      this.erro.set('As senhas não conferem.');
      return;
    }

    localStorage.setItem('casa-do-frango-mock-password', newPassword!);
    this.view.set('login');
    this.form.patchValue({ email: this.recoveryForm.controls.email.value, senha: '' });
    this.erro.set(null);
    this.aviso.set('Senha redefinida com sucesso. Você já pode entrar.');
    this.codeForm.reset();
  }
}
