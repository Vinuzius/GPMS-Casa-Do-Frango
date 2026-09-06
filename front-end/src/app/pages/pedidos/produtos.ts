import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';

@Component({
  selector: 'app-produtos',
  imports: [
    ...SHARED_IMPORTS,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './produtos.html',
  styleUrl: './produtos.scss',
})
export class Produtos {}
