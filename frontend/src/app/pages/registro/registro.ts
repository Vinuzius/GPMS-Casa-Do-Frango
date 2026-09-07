import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefone: [''],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  enviando = false;
  erro: string | null = null;
  cadastroPendenteConfirmacao = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nome, email, telefone, senha } = this.form.getRawValue();
    this.enviando = true;
    this.erro = null;

    const { data, error } = await this.authService.signUp(email!, senha!, nome!, telefone || undefined);

    this.enviando = false;

    if (error) {
      this.erro = 'Não foi possível criar a conta. Verifique os dados e tente novamente.';
      return;
    }

    if (data.session) {
      this.router.navigateByUrl('/dashboard');
    } else {
      this.cadastroPendenteConfirmacao = true;
    }
  }
}
