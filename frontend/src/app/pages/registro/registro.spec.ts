import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../shared/services/auth.service';
import { Registro } from './registro';

describe('Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;
  let signUp: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    signUp = vi.fn();

    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [provideRouter([]), { provide: AuthService, useValue: { signUp } }],
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  async function cadastrar(): Promise<(resposta: unknown) => Promise<void>> {
    let responder!: (resposta: unknown) => void;
    signUp.mockReturnValue(new Promise((resolve) => (responder = resolve)));

    component.form.setValue({ nome: 'Ana', email: 'ana@teste.com', telefone: '', senha: '123456' });
    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    return async (resposta: unknown) => {
      responder(resposta);
      await new Promise((resolve) => setTimeout(resolve)); // deixa o componente tratar a resposta
      await fixture.whenStable();
    };
  }

  it('mostra o erro e libera o botão quando o cadastro falha', async () => {
    const responder = await cadastrar();
    const botao: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(botao.textContent).toContain('Criando conta...');

    await responder({ data: { session: null }, error: { message: 'User already registered' } });

    expect(fixture.nativeElement.querySelector('.erro-geral')?.textContent).toContain('Não foi possível criar a conta');
    expect(botao.disabled).toBe(false);
    expect(botao.textContent).not.toContain('Criando conta...');
  });

  it('pede a confirmação do e-mail quando o cadastro não devolve sessão', async () => {
    const responder = await cadastrar();

    await responder({ data: { session: null }, error: null });

    expect(signUp).toHaveBeenCalledWith('ana@teste.com', '123456', 'Ana', undefined);
    expect(fixture.nativeElement.textContent).toContain('Verifique seu e-mail');
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });
});
