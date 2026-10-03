import { Component, HostListener, OnInit, Signal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';
import { CartService } from '../../shared/services/cart.service';

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

interface UserProfile {
  name: string;
  email: string;
  birthDate: string;
  gender: string;
  phone: string;
}

@Component({
  selector: 'app-perfil',
  imports: [...SHARED_IMPORTS, ...MATERIAL_IMPORTS],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil implements OnInit {
  activeSection = signal<ProfileSection>('details');
  profile = signal<UserProfile>(this.loadProfile());
  addresses = signal<Address[]>(this.loadAddresses());
  isAddressFormOpen = signal(false);
  editingAddressIndex = signal<number | null>(null);
  addressDraft: Address = this.emptyAddress();
  profileDraft: UserProfile = { ...this.profile() };
  readonly cartNotice: Signal<string | null>;

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
  ) {
    this.cartNotice = this.cartService.cartNotice;
  }

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

  hasProfileChanges(): boolean {
    return JSON.stringify(this.profileDraft) !== JSON.stringify(this.profile());
  }

  saveProfile(): void {
    if (!this.profileDraft.name.trim() || !this.profileDraft.email.trim()) return;

    const updatedProfile: UserProfile = {
      ...this.profileDraft,
      name: this.profileDraft.name.trim(),
      email: this.profileDraft.email.trim(),
      phone: this.profileDraft.phone.trim(),
    };
    this.profile.set(updatedProfile);
    this.profileDraft = { ...updatedProfile };
    localStorage.setItem('casa-do-frango-profile', JSON.stringify(updatedProfile));
    this.showNotice('Dados cadastrais salvos com sucesso.');
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
    this.showNotice('Endereço excluído com sucesso.');
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
    this.showNotice(index === null ? 'Endereço salvo com sucesso.' : 'Endereço atualizado com sucesso.');
  }

  dismissCartNotice(): void {
    this.cartService.clearNotice();
  }

  @HostListener('document:keydown.escape')
  closeAddressDialogWithEscape(): void {
    if (this.isAddressFormOpen()) this.cancelAddressForm();
  }

  private emptyAddress(): Address {
    return { label: '', street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' };
  }

  private loadProfile(): UserProfile {
    const storedProfile = localStorage.getItem('casa-do-frango-profile');
    if (storedProfile) {
      try {
        return { ...this.defaultProfile(), ...JSON.parse(storedProfile) } as UserProfile;
      } catch {
        localStorage.removeItem('casa-do-frango-profile');
      }
    }

    return this.defaultProfile();
  }

  private defaultProfile(): UserProfile {
    return {
      name: 'Paulo Henrique Ganso',
      email: 'phgansolu@gmail.com',
      birthDate: '1989-10-12',
      gender: 'Homem',
      phone: '(21) 9 4002 8922',
    };
  }

  private showNotice(message: string): void {
    this.cartService.showNotice(message);
    window.setTimeout(() => {
      if (this.cartNotice() === message) this.cartService.clearNotice();
    }, 5000);
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
