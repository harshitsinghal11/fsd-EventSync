export type AdminSession = {
  id: string | number;
  email: string;
  name?: string | null;
  role: string;
  loginAt: string;
  expiresAt: string;
};
