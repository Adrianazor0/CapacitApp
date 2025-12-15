import { createContext, useState, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { loginRequest } from "../api/auth";
import type { LoginRequest } from "../api/auth";
import type { User } from "../types/index"

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    errors: string[];
    signin: (user: LoginRequest) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider")
    return context;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const signin = async (user: LoginRequest) => {
        setLoading(true);
        try {
            const res = await loginRequest(user);
            setUser(res.data);
            setIsAuthenticated(true);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data))
        } catch (error: any) {
            if (Array.isArray(error.response.data)) {
                return setErrors(error.response.data);
            }
            setErrors([error.response.data.message || "Error al inicar sesion"])
        } finally {
            setLoading(false);
        }
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false)
    }

    useEffect(() => {
        const checkLogin = () => {
            const token = localStorage.getItem("token")
            const storedUser = localStorage.getItem("user")

            if (!token || !storedUser) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setLoading(false); 
            }
        };
        checkLogin();
    }, []);

    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([]);
            }, 5000);
            return () => clearTimeout(timer)
        }
    })

    return (
        <AuthContext.Provider value={{
            signin,
            logout,
            user,
            isAuthenticated,
            errors,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};
