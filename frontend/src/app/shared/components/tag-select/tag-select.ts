import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface TagOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-tag-select',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './tag-select.html',
  styleUrl: './tag-select.scss',
})
export class TagSelect {
  @Input() options: TagOption[] = [];
  @Input() selectedIds: string[] = [];
  @Input() placeholder = 'Buscar...';
  @Output() selectedIdsChange = new EventEmitter<string[]>();

  searchTerm = '';
  isOpen = false;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  get selectedOptions(): TagOption[] {
    return this.options.filter((o) => this.selectedIds.includes(o.id));
  }

  get filteredOptions(): TagOption[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.options
      .filter((o) => !this.selectedIds.includes(o.id))
      .filter((o) => !term || o.name.toLowerCase().includes(term));
  }

  openDropdown(): void {
    this.isOpen = true;
  }

  selectOption(option: TagOption): void {
    this.selectedIds = [...this.selectedIds, option.id];
    this.selectedIdsChange.emit(this.selectedIds);
    this.searchTerm = '';
  }

  removeOption(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedIds = this.selectedIds.filter((i) => i !== id);
    this.selectedIdsChange.emit(this.selectedIds);
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    const clickedInside = target instanceof Node && this.elementRef.nativeElement.contains(target);
    if (!clickedInside) this.isOpen = false;
  }
}