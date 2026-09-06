import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';

@Component({
  selector: 'app-notificacoes',
  imports: [
    ...SHARED_IMPORTS,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './notificacoes.html',
  styleUrl: './notificacoes.scss',
})
export class Notificacoes {}
