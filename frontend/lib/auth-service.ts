import { apiRequest } from "./api-client";

export type LoginInput = { email: string; password: string };
export type RegisterInput = {
  email: string;
  username: string;
  password: string;
};
export type AuthToken = { access_token: string; token_type: string };
export type RegisteredUser = {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
};

export const authService = {
  login: (input: LoginInput) =>
    apiRequest<AuthToken>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  register: (input: RegisterInput) =>
    apiRequest<RegisteredUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
