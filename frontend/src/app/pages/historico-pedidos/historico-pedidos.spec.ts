import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HistoricoPedidos } from './historico-pedidos';

describe('HistoricoPedidos', () => {
  let component: HistoricoPedidos;
  let fixture: ComponentFixture<HistoricoPedidos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoPedidos],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoPedidos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
