import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  moveCarousel(direction: number, track: HTMLElement): void {
    const firstCard = track.querySelector('.product-card') as HTMLElement | null;
    if (!firstCard) return;

    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    const step = firstCard.offsetWidth + gap;

    track.scrollBy({
      left: direction * step,
      behavior: 'smooth',
    });
  }
}