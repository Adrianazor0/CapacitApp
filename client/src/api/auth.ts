import client from "./axios"
import type { AuthResponse} from "../types"

export interface LoginRequest {
    username: string;
    password: string;
}

export const loginRequest = async (user: LoginRequest) =>
    client.post<AuthResponse>("/auth/login", user)

export const registerRequest = async (user: any) =>
    client.post<AuthResponse>("/auth/register", user)