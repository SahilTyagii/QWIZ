import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL

export const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuthStatus() {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get(`${apiUrl}/api/users/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        }

        checkAuthStatus();
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        setLoading(true);
        axios.get(`${apiUrl}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                setUser(response.data);
            })
            .catch(() => {
                setIsAuthenticated(false);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const logout = async () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}
