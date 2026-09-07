import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PedidosAndamento } from './pedidos-andamento';

describe('PedidosAndamento', () => {
  let component: PedidosAndamento;
  let fixture: ComponentFixture<PedidosAndamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosAndamento],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PedidosAndamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
