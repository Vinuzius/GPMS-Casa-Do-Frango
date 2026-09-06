import { computed, Injectable, signal } from '@angular/core';
import { Product, ProductSize } from '../models/product.model';

export interface CartItem {
  product: Product;
  size?: ProductSize;
  quantity: number;
  unitPrice: number;
}

const CART_STORAGE_KEY = 'casa-do-frango-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly items = signal<CartItem[]>(this.loadItems());
  private readonly notice = signal<string | null>(null);
  readonly cartItems = this.items.asReadonly();
  readonly cartNotice = this.notice.asReadonly();
  readonly itemCount = computed(() => this.items().reduce((total, item) => total + item.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((total, item) => total + item.unitPrice * item.quantity, 0));

  add(product: Product, size: ProductSize | undefined, quantity: number): void {
    const unitPrice = product.price + (size?.priceModifier ?? 0);
    const itemKey = this.getItemKey(product, size);
    const existingItem = this.items().find((item) => this.getItemKey(item.product, item.size) === itemKey);

    if (existingItem) {
      this.items.update((items) => items.map((item) =>
        this.getItemKey(item.product, item.size) === itemKey
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      ));
    } else {
      this.items.update((items) => [...items, { product, size, quantity, unitPrice }]);
    }

    this.persist();
  }

  showNotice(message: string): void {
    this.notice.set(message);
  }

  clearNotice(): void {
    this.notice.set(null);
  }

  increase(index: number): void {
    this.items.update((items) => items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, quantity: item.quantity + 1 } : item,
    ));
    this.persist();
  }

  decrease(index: number): void {
    const item = this.items()[index];
    if (!item) return;

    if (item.quantity === 1) {
      this.remove(index);
      return;
    }

    this.items.update((items) => items.map((currentItem, itemIndex) =>
      itemIndex === index ? { ...currentItem, quantity: currentItem.quantity - 1 } : currentItem,
    ));
    this.persist();
  }

  remove(index: number): void {
    this.items.update((items) => items.filter((_, itemIndex) => itemIndex !== index));
    this.persist();
  }

  private getItemKey(product: Product, size?: ProductSize): string {
    return `${product.id}:${size?.label ?? 'default'}`;
  }

  private loadItems(): CartItem[] {
    const storedItems = localStorage.getItem(CART_STORAGE_KEY);
    if (!storedItems) return [];

    try {
      return JSON.parse(storedItems) as CartItem[];
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
  }

  private persist(): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items()));
  }
}
