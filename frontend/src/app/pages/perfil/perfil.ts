import { Component, HostListener, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';

type ProfileSection = 'details' | 'addresses';

interface Address {
  label: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

@Component({
  selector: 'app-perfil',
  imports: [...SHARED_IMPORTS, ...MATERIAL_IMPORTS],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  activeSection = signal<ProfileSection>('details');
  addresses = signal<Address[]>(this.loadAddresses());
  isAddressFormOpen = signal(false);
  editingAddressIndex = signal<number | null>(null);
  addressDraft: Address = this.emptyAddress();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const section = params.get('secao');

      if (section === 'enderecos') {
        this.showAddresses();
      } else if (section === 'dados') {
        this.showDetails();
      }
    });
  }

  showDetails(): void {
    this.activeSection.set('details');
  }

  showAddresses(): void {
    this.activeSection.set('addresses');
  }

  editAddress(index: number): void {
    const address = this.addresses()[index];
    if (!address) return;

    this.addressDraft = { ...address };
    this.editingAddressIndex.set(index);
    this.isAddressFormOpen.set(true);
  }

  addAddress(): void {
    this.addressDraft = this.emptyAddress();
    this.editingAddressIndex.set(null);
    this.isAddressFormOpen.set(true);
  }

  cancelAddressForm(): void {
    this.isAddressFormOpen.set(false);
  }

  deleteAddress(): void {
    const index = this.editingAddressIndex();
    if (index === null) return;

    const address = this.addresses()[index];
    if (!address || !window.confirm(`Excluir o endereço "${address.label || 'selecionado'}"?`)) return;

    this.addresses.update((addresses) => addresses.filter((_, addressIndex) => addressIndex !== index));
    localStorage.setItem('casa-do-frango-addresses', JSON.stringify(this.addresses()));
    this.isAddressFormOpen.set(false);
  }

  saveAddress(): void {
    if (!this.addressDraft.street.trim() || !this.addressDraft.number.trim()) return;

    const newAddress: Address = {
      ...this.addressDraft,
      label: this.addressDraft.label.trim() || `Endereço ${this.addresses().length + 1}`,
    };
    const index = this.editingAddressIndex();
    this.addresses.update((addresses) => {
      if (index === null) return [...addresses, newAddress];

      return addresses.map((address, addressIndex) => addressIndex === index ? newAddress : address);
    });
    localStorage.setItem('casa-do-frango-addresses', JSON.stringify(this.addresses()));
    this.isAddressFormOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeAddressDialogWithEscape(): void {
    if (this.isAddressFormOpen()) this.cancelAddressForm();
  }

  private emptyAddress(): Address {
    return { label: '', street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' };
  }

  private loadAddresses(): Address[] {
    const storedAddresses = localStorage.getItem('casa-do-frango-addresses');
    if (storedAddresses) {
      try {
        return JSON.parse(storedAddresses) as Address[];
      } catch {
        localStorage.removeItem('casa-do-frango-addresses');
      }
    }

    return [{ label: 'Casa', street: 'Rua das Flores', number: '123', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', zipCode: '01000-000' }];
  }
}
