import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Especialidad } from '../types';

export type Rol = 'doctor' | 'paciente' | 'recepcion';

// esto es lo que va a guardar el contexto sobre quien inicio sesion
export interface AuthUser {
  rol: Rol;
  id: string;
  nombre: string;
  usuario: string;
  especialidad?: Especialidad; // solo aplica si rol === 'doctor'
  edad?: number;               // solo aplica si rol === 'paciente'
  telefono?: string;           // solo aplica si rol === 'paciente'
}

interface AuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (nuevoUsuario: AuthUser) => {
    setUser(nuevoUsuario);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

//hook para usar el contexto facil desde cualquier pantalla
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}