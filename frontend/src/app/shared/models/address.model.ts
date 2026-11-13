export interface Address {
  id?: number; // ausente enquanto o endereço ainda não foi salvo
  label: string;
  isPrimary: boolean;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export function emptyAddress(): Address {
  return { label: '', isPrimary: false, street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' };
}
