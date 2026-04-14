import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_votiix_key_change_in_production';

export interface AuthPayload {
  mosip_uin?: string;    // Citizen identity from MOSIP eSignet
  terminal_id?: string;  // Terminal hardware ID
  officer_id?: string;
  role?: string;
  session_id?: string;
  election_id?: string;
}

export const signToken = (payload: AuthPayload, expiresIn: string | number = '1h'): string => {
  return jwt.sign(payload as object, JWT_SECRET, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
};
