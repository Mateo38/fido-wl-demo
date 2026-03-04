export type AccountType = 'checking' | 'savings';

export interface Account {
  id: string;
  user_id: string;
  iban: string;
  bic: string;
  account_type: AccountType;
  balance: number;
  currency: string;
  label: string;
  created_at: string;
}

export type TransactionCategory =
  | 'salary'
  | 'rent'
  | 'groceries'
  | 'utilities'
  | 'transport'
  | 'entertainment'
  | 'restaurant'
  | 'shopping'
  | 'health'
  | 'insurance'
  | 'subscription'
  | 'transfer'
  | 'other';

export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  account_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  category: TransactionCategory;
  counterparty: string;
  reference: string | null;
  date: string;
  created_at: string;
}

export type CardNetwork = 'visa' | 'mastercard';
export type CardTier = 'standard' | 'premium' | 'metal';
export type CardStatus = 'active' | 'frozen' | 'blocked';

export interface Card {
  id: string;
  user_id: string;
  account_id: string;
  card_number_last4: string;
  card_network: CardNetwork;
  card_tier: CardTier;
  expiry_date: string;
  status: CardStatus;
  contactless_enabled: boolean;
  online_payments_enabled: boolean;
  daily_limit: number;
  monthly_limit: number;
  created_at: string;
}

export interface Beneficiary {
  id: string;
  user_id: string;
  name: string;
  iban: string;
  bic: string;
  label: string | null;
  created_at: string;
}

export interface TransferRequest {
  from_account_id: string;
  beneficiary_id: string;
  amount: number;
  description: string;
}
