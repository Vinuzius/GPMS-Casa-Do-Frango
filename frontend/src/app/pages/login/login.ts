import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../shared/services/auth.service';

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

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  enviando = false;
  erro: string | null = null;

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
    this.enviando = true;
    this.erro = null;

    const { error } = await this.authService.signIn(email!, senha!);

    this.enviando = false;

    if (error) {
      this.erro = traduzirErro(error.message);
      return;
    }

    this.router.navigateByUrl('/dashboard');
  }
}
