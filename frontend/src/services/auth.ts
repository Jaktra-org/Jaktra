import { api } from "./api";
import type {
  AuthResponse,
  RegisterResponse,
  LoginResponse,
  MfaSetupInitiateResponse,
  MfaSetupConfirmResponse,
  User,
} from "../types/api";

export const authService = {
  async login(credentials: Record<string, string>): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    const data = response.data;

    if ("mfaPending" in data && data.mfaPending) {
      sessionStorage.setItem("mfa_pending_token", data.mfaPendingToken);
      return data;
    }

    if ("token" in data && data.token) {
      localStorage.setItem("auth_token", data.token);
    }
    return data;
  },

  async mfaVerify(code: string): Promise<AuthResponse> {
    const mfaPendingToken = sessionStorage.getItem("mfa_pending_token");
    if (!mfaPendingToken) {
      throw new Error("No MFA session found. Please log in again.");
    }
    const response = await api.post<AuthResponse>("/auth/mfa/verify", {
      mfaPendingToken,
      code,
    });
    sessionStorage.removeItem("mfa_pending_token");
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
    }
    return response.data;
  },

  async onboard(data: Record<string, string>): Promise<AuthResponse | RegisterResponse> {
    const response = await api.post<AuthResponse | RegisterResponse>("/auth/onboard", data);
    const result = response.data;
    if ("token" in result && result.token) {
      localStorage.setItem("auth_token", result.token);
    }
    return result;
  },

  async register(data: Record<string, string>): Promise<AuthResponse | RegisterResponse> {
    const response = await api.post<AuthResponse | RegisterResponse>("/auth/register", data);
    const result = response.data;
    if ("token" in result && result.token) {
      localStorage.setItem("auth_token", result.token);
    }
    return result;
  },

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/verify-email", { email, code });
    const result = response.data;
    if (result.token) {
      localStorage.setItem("auth_token", result.token);
    }
    return result;
  },

  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>("/auth/resend-verification", { email });
    return response.data;
  },

  logout(): void {
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("mfa_pending_token");
    window.location.href = "/login";
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },

  async updateProfile(name: string): Promise<User> {
    const response = await api.patch<User>("/auth/profile", { name });
    return response.data;
  },


  async mfaSetupInitiate(): Promise<MfaSetupInitiateResponse> {
    const response = await api.post<MfaSetupInitiateResponse>("/auth/mfa/setup");
    return response.data;
  },

  async mfaSetupConfirm(code: string): Promise<MfaSetupConfirmResponse> {
    const response = await api.post<MfaSetupConfirmResponse>("/auth/mfa/confirm", { code });
    return response.data;
  },

  async mfaDisable(code: string): Promise<void> {
    await api.delete("/auth/mfa", { data: { code } });
  },
};
