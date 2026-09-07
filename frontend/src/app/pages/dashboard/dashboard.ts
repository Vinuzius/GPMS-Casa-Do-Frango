import { Component, Signal } from '@angular/core';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductsService } from '../../shared/services/products.service';
import { Product } from '../../shared/models/product.model';
import { CartService } from '../../shared/services/cart.service';
import { MatIconModule } from '@angular/material/icon';

interface PromoBanner {
  variant: 'photo' | 'solid';
  color?: 'green' | 'orange';
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [ProductCard, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})

export class Dashboard {
  meals: Product[] = [];
  drinks: Product[] = [];
  readonly cartNotice: Signal<string | null>;

  promos: PromoBanner[] = [
    {
      variant: 'photo',
      title: 'Costela em\nPromoção',
      subtitle: 'Apenas Hoje!',
      imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=900&q=80',
    },
    {
      variant: 'solid',
      color: 'green',
      title: '15% de\nDesconto em Frango',
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&q=80',
    },
    {
      variant: 'photo',
      title: 'Combo\nFamília',
      subtitle: '2 Frangos + Brinde',
      imageUrl: 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=900&q=80',
    },
    {
      variant: 'solid',
      color: 'orange',
      title: 'Frete Grátis',
      subtitle: 'Acima de R$ 50',
    },
    {
      variant: 'photo',
      title: 'Parmegiana\nem Dobro',
      subtitle: 'Só nas Terças',
      imageUrl: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=900&q=80',
    },
  ];

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
  ) {
    this.cartNotice = this.cartService.cartNotice;
    if (this.cartNotice()) window.setTimeout(() => this.cartService.clearNotice(), 5000);
  }

  ngOnInit(): void {
    this.meals = this.productsService
    // nao mostra quem é false
      .getProductsByCategory('refeicoes')
      .filter((p) => p.available !== false);  

    this.drinks = this.productsService
      .getProductsByCategory('bebidas')
      .filter((p) => p.available !== false);
  }

  moveCarousel(direction: number, track: HTMLElement): void {
    const firstItem = track.querySelector('.product-card, .promo-card') as HTMLElement | null;
    if (!firstItem) return;

    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    const step = firstItem.offsetWidth + gap;

    track.scrollBy({
      left: direction * step,
      behavior: 'smooth',
    });
  }

  dismissCartNotice(): void {
    this.cartService.clearNotice();
  }
}