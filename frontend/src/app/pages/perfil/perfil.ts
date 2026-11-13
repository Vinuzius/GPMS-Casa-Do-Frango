import { Component, HostListener, OnInit, Signal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SHARED_IMPORTS } from '../../shared/shared-import';
import { MATERIAL_IMPORTS } from '../../shared/material-imports';
import { CartService } from '../../shared/services/cart.service';
import { Address, emptyAddress } from '../../shared/models/address.model';
import { AddressesService } from '../../shared/services/addresses.service';
import { mensagemDeErro } from '../../shared/utils/http-error';

type ProfileSection = 'details' | 'addresses' | 'password';

interface UserProfile {
  name: string;
  email: string;
  birthDate: string;
  gender: string;
  phone: string;
}

interface PasswordDraft {
  current: string;
  next: string;
  confirmation: string;
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
  readonly addresses: Signal<Address[]>;
  isAddressFormOpen = signal(false);
  editingAddressIndex = signal<number | null>(null);
  addressDraft: Address = emptyAddress();
  profileDraft: UserProfile = { ...this.profile() };
  passwordDraft: PasswordDraft = this.emptyPasswordDraft();
  readonly cartNotice: Signal<string | null>;

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    private addressesService: AddressesService,
  ) {
    this.cartNotice = this.cartService.cartNotice;
    this.addresses = this.addressesService.addresses;
    this.addressesService.load().catch(() => this.showNotice('Não foi possível carregar seus endereços.'));
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const section = params.get('secao');

      if (section === 'enderecos') {
        this.showAddresses();
      } else if (section === 'dados') {
        this.showDetails();
      } else if (section === 'senha') {
        this.showPassword();
      }
    });
  }

  showDetails(): void {
    this.activeSection.set('details');
  }

  showAddresses(): void {
    this.activeSection.set('addresses');
  }

  showPassword(): void {
    this.activeSection.set('password');
    this.passwordDraft = this.emptyPasswordDraft();
  }

  savePassword(): void {
    const { current, next, confirmation } = this.passwordDraft;
    if (!current || !next || !confirmation) return;

    const storedPassword = localStorage.getItem('casa-do-frango-mock-password') ?? '123456';
    if (current !== storedPassword) {
      this.showNotice('A senha atual está incorreta.');
      return;
    }
    if (next.length < 6) {
      this.showNotice('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (next !== confirmation) {
      this.showNotice('A confirmação da nova senha não confere.');
      return;
    }
    if (next === current) {
      this.showNotice('A nova senha deve ser diferente da senha atual.');
      return;
    }

    localStorage.setItem('casa-do-frango-mock-password', next);
    this.passwordDraft = this.emptyPasswordDraft();
    this.showNotice('Senha alterada com sucesso.');
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
    this.addressDraft = emptyAddress();
    this.editingAddressIndex.set(null);
    this.isAddressFormOpen.set(true);
  }

  cancelAddressForm(): void {
    this.isAddressFormOpen.set(false);
  }

  async deleteAddress(): Promise<void> {
    const index = this.editingAddressIndex();
    if (index === null) return;

    const address = this.addresses()[index];
    if (!address?.id || !window.confirm(`Excluir o endereço "${address.label || 'selecionado'}"?`)) return;

    try {
      await this.addressesService.remove(address.id);
      this.isAddressFormOpen.set(false);
      this.showNotice('Endereço excluído com sucesso.');
    } catch (erro) {
      this.showNotice(mensagemDeErro(erro, 'Não foi possível excluir o endereço.'));
    }
  }

  async saveAddress(): Promise<void> {
    if (!this.addressDraft.street.trim() || !this.addressDraft.number.trim()) return;

    const address: Address = {
      ...this.addressDraft,
      label: this.addressDraft.label.trim() || `Endereço ${this.addresses().length + 1}`,
    };
    const editing = this.editingAddressIndex() !== null;
    try {
      if (editing) {
        await this.addressesService.update(address);
      } else {
        await this.addressesService.create(address);
      }
      this.isAddressFormOpen.set(false);
      this.showNotice(editing ? 'Endereço atualizado com sucesso.' : 'Endereço salvo com sucesso.');
    } catch (erro) {
      this.showNotice(mensagemDeErro(erro, 'Não foi possível salvar o endereço.'));
    }
  }

  async makeAddressPrimary(index: number): Promise<void> {
    const address = this.addresses()[index];
    if (!address?.id || address.isPrimary) return;

    try {
      await this.addressesService.makePrimary(address.id);
      this.isAddressFormOpen.set(false);
      this.showNotice('Endereço principal atualizado com sucesso.');
    } catch (erro) {
      this.showNotice(mensagemDeErro(erro, 'Não foi possível atualizar o endereço principal.'));
    }
  }

  dismissCartNotice(): void {
    this.cartService.clearNotice();
  }

  @HostListener('document:keydown.escape')
  closeAddressDialogWithEscape(): void {
    if (this.isAddressFormOpen()) this.cancelAddressForm();
  }

  private emptyPasswordDraft(): PasswordDraft {
    return { current: '', next: '', confirmation: '' };
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
}
