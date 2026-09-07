import { AfterViewInit, Component, ElementRef, HostListener, Signal, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { NotificationsService } from '../../services/notifications.service';

import { AuthService } from '../../services/auth.service';
import { PerfilService } from '../../services/perfil.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements AfterViewInit {
  @ViewChild('topbarEl') topbarEl!: ElementRef<HTMLElement>;

  isProfileMenuOpen = false;
  readonly cartItemCount: Signal<number>;
  readonly unreadNotificationCount: Signal<number>;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private router: Router,
    protected authService: AuthService,
    protected perfilService: PerfilService,
    cartService: CartService,
    notificationsService: NotificationsService,
  ) {
    this.cartItemCount = cartService.itemCount;
    this.unreadNotificationCount = notificationsService.unreadCount;
  }

  search(term: string): void {
    const trimmed = term.trim();
    this.router.navigate(['/cardapio'], {
      queryParams: { busca: trimmed || null },
    });
  }

  ngAfterViewInit(): void {
    this.updateTopbarHeight();
  }

  @HostListener('window:resize')
  updateTopbarHeight(): void {
    const height = this.topbarEl.nativeElement.offsetHeight;
    document.documentElement.style.setProperty('--topbar-height', `${height}px`);
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  async sair(): Promise<void> {
    this.closeProfileMenu();
    await this.authService.signOut();
    this.router.navigateByUrl('/login');
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!this.isProfileMenuOpen) return;
    const clickedInside = target instanceof Node && this.elementRef.nativeElement.contains(target);
    if (!clickedInside) this.closeProfileMenu();
  }
}