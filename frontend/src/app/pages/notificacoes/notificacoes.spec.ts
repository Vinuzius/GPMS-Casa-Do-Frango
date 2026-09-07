import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Notificacoes } from './notificacoes';

describe('Notificacoes', () => {
  let component: Notificacoes;
  let fixture: ComponentFixture<Notificacoes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notificacoes],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Notificacoes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
