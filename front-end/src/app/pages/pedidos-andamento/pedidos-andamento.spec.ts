import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosAndamento } from './pedidos-andamento';

describe('PedidosAndamento', () => {
  let component: PedidosAndamento;
  let fixture: ComponentFixture<PedidosAndamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosAndamento],
    }).compileComponents();

    fixture = TestBed.createComponent(PedidosAndamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
