import { Component } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { MATERIAL_IMPORTS } from '../material-imports';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, ...MATERIAL_IMPORTS],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {}