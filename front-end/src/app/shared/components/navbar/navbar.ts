import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements AfterViewInit {
  @ViewChild('topbarEl') topbarEl!: ElementRef<HTMLElement>;

  isProfileMenuOpen = false;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

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

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!this.isProfileMenuOpen) return;
    const clickedInside = target instanceof Node && this.elementRef.nativeElement.contains(target);
    if (!clickedInside) this.closeProfileMenu();
  }
}