// src/app/shared/shared-imports.ts
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardHeader, MatCardModule } from '@angular/material/card';
import { RouterLink, RouterOutlet } from '@angular/router';

export const SHARED_IMPORTS = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterLink,
  RouterOutlet
];