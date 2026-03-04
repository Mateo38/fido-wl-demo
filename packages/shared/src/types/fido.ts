export interface Passkey {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  device_type: string;
  backed_up: boolean;
  transports: string[];
  created_at: string;
  last_used_at: string | null;
  friendly_name: string | null;
}

export interface Challenge {
  id: string;
  user_id: string | null;
  challenge: string;
  type: 'registration' | 'authentication';
  expires_at: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  status: 'success' | 'failure';
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface ActivityLogWithUser extends ActivityLog {
  user_email: string | null;
  user_first_name: string | null;
  user_last_name: string | null;
}
