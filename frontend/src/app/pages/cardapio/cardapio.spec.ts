import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { Cardapio } from './cardapio';

describe('Cardapio', () => {
  let component: Cardapio;
  let fixture: ComponentFixture<Cardapio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cardapio],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Cardapio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
