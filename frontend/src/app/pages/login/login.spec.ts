import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../../shared/services/auth.service';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let signIn: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    signIn = vi.fn();

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), { provide: AuthService, useValue: { signIn } }],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  // Envia o formulário e devolve uma função que entrega a resposta da Supabase depois,
  // como acontece com a rede de verdade: a tela renderiza "Entrando..." antes da resposta.
  async function entrar(email: string, senha: string): Promise<(resposta: unknown) => Promise<void>> {
    let responder!: (resposta: unknown) => void;
    signIn.mockReturnValue(new Promise((resolve) => (responder = resolve)));

    component.form.setValue({ email, senha });
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    return async (resposta: unknown) => {
      responder(resposta);
      await new Promise((resolve) => setTimeout(resolve)); // deixa o componente tratar a resposta
      await fixture.whenStable();
    };
  }

  function botao(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('mostra o erro e libera o botão quando a senha está incorreta', async () => {
    const responder = await entrar('cliente@teste.com', 'senha-errada');

    expect(signIn).toHaveBeenCalledWith('cliente@teste.com', 'senha-errada');
    expect(botao().disabled).toBe(true);
    expect(botao().textContent).toContain('Entrando...');

    await responder({ error: { message: 'Invalid login credentials' } });

    expect(fixture.nativeElement.querySelector('.erro-geral')?.textContent).toContain('E-mail ou senha inválidos.');
    expect(botao().disabled).toBe(false);
    expect(botao().textContent).not.toContain('Entrando');
  });

  it('avisa quando o e-mail ainda não foi confirmado', async () => {
    const responder = await entrar('cliente@teste.com', 'senha-certa');

    await responder({ error: { message: 'Email not confirmed' } });

    expect(fixture.nativeElement.querySelector('.erro-geral')?.textContent).toContain('Confirme seu e-mail');
  });

  it('vai para o dashboard quando o login dá certo', async () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const responder = await entrar('cliente@teste.com', 'senha-certa');

    await responder({ error: null });

    expect(navegar).toHaveBeenCalledWith('/dashboard');
    expect(fixture.nativeElement.querySelector('.erro-geral')).toBeNull();
  });
});
