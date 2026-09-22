import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Rol = 'paciente' | 'doctor' | 'recepcion';

export interface AuthUser {
  id: string;
  nombre: string;
  usuario: string;
  rol: Rol;
  email?: string;
  debeCambiarPassword?: boolean;
  esMock?: boolean; //true = doctor/recepcion viejo de mockData sin cuenta real en Supabase todavía
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginMock: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const cargarPerfilDesdeSesion = async (email: string | undefined) => {
    if (!email) {
      setUser(null);
      return;
    }

    const { data: perfil, error } = await supabase
      .from('perfiles')
      .select('id, usuario, nombre, rol, debe_cambiar_password, email')
      .eq('email', email)
      .single();

    if (perfil && !error) {
      setUser({
        id: perfil.id,
        nombre: perfil.nombre,
        usuario: perfil.usuario,
        rol: perfil.rol,
        email: perfil.email,
        debeCambiarPassword: perfil.debe_cambiar_password,
        esMock: false,
      });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    //revisa si ya hay una sesion de Supabase guardada al abrir la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      cargarPerfilDesdeSesion(session?.user?.email).finally(() => setLoading(false));
    });

    //escucha cambios de sesion (login/logout) en tiempo real
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      cargarPerfilDesdeSesion(session?.user?.email);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  //para cuando el login es de doctor/recepcion viejo(mockData sin Supabase todavia)
  const loginMock = (mockUser: AuthUser) => {
    setUser({ ...mockUser, esMock: true });
  };

  const logout = async () => {
    if (user && !user.esMock) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginMock, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}