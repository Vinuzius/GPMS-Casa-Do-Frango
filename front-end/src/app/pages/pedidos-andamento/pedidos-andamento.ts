import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';

@Component({
  selector: 'app-pedidos-andamento',
  imports: [...SHARED_IMPORTS, ...MATERIAL_IMPORTS],
  templateUrl: './pedidos-andamento.html',
  styleUrl: './pedidos-andamento.scss',
})
export class PedidosAndamento {}
