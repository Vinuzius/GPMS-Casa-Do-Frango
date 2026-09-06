import { Component, signal } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';

type ServiceType = 'delivery' | 'pickup';

@Component({
  selector: 'app-carrinho',
  imports: [
    ...SHARED_IMPORTS,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.scss',
})
export class Carrinho {
  selectedService = signal<ServiceType>('delivery');

  selectService(service: ServiceType): void {
    this.selectedService.set(service);
  }
}
