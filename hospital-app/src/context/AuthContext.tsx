import React, { createContext, useContext, useEffect, useState } from 'react';
import { doctores, recepcionistas } from '../data/mockData';
import { supabase } from '../../lib/supabase';

export type Rol = 'doctor' | 'paciente' | 'recepcion';
type Especialidad = string;

export interface AuthUser {
  id: string;
  nombre: string;
  usuario: string;
  rol: Rol;
  especialidad?: Especialidad;
  edad?: number;
  telefono?: string;
  debeCambiarPassword?: boolean;
}

interface ResultadoAuth {
  exito: boolean;
  error?: string;
  rol?: Rol;
  debeCambiarPassword?: boolean;
}

interface DatosRegistro {
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  fechaNacimiento: string;
  telefono: string;
  identidad: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (usuario: string, contraseña: string) => Promise<ResultadoAuth>;
  register: (datos: DatosRegistro) => Promise<ResultadoAuth>;
  logout: () => Promise<void>;
}

function calcularEdad(fechaNacimiento: string): number {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Revisa si ya hay una sesión de Supabase guardada al abrir la app
    supabase.auth.getSession().finally(() => setLoading(false));
  }, []);

  const login = async (usuario: string, contrasena: string): Promise<ResultadoAuth> => {
    if (usuario.trim() === '' || contrasena.trim() === '') {
      return { exito: false, error: 'Debes ingresar usuario y contraseña' };
    }

    // 1. Buscar el perfil en Supabase por el campo "usuario"
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('id, email, rol, nombre, usuario, especialidad, telefono, fecha_nacimiento, debe_cambiar_password')
      .eq('usuario', usuario.trim())
      .single();

    if (perfil && !perfilError) {
      // 2. Existe en Supabase: intentar login real
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: perfil.email,
        password: contrasena,
      });

      if (authError) {
        return { exito: false, error: 'Usuario o contraseña incorrectos' };
      }

      const edadCalculada = perfil.fecha_nacimiento ? calcularEdad(perfil.fecha_nacimiento) : undefined;

      const nuevoUsuario: AuthUser = {
        rol: perfil.rol,
        id: perfil.id,
        nombre: perfil.nombre,
        usuario: perfil.usuario,
        especialidad: perfil.especialidad ?? undefined,
        edad: edadCalculada,
        telefono: perfil.telefono ?? undefined,
        debeCambiarPassword: perfil.debe_cambiar_password,
      };

      setUser(nuevoUsuario);
      return { exito: true, rol: perfil.rol, debeCambiarPassword: perfil.debe_cambiar_password };
    }

    // 3. No existe en Supabase: revisar el mock (temporal, doctor/recepcion)
    const doctorValido = doctores.find((d) => d.usuario === usuario && d.contrasena === contrasena);
    if (doctorValido) {
      setUser({
        rol: 'doctor',
        id: doctorValido.id,
        nombre: doctorValido.nombre,
        usuario: doctorValido.usuario,
        especialidad: doctorValido.especialidad,
      });
      return { exito: true, rol: 'doctor' };
    }

    const recepcionistaValido = recepcionistas.find((r) => r.usuario === usuario && r.contrasena === contrasena);
    if (recepcionistaValido) {
      setUser({
        rol: 'recepcion',
        id: recepcionistaValido.id,
        nombre: recepcionistaValido.nombre,
        usuario: recepcionistaValido.usuario,
      });
      return { exito: true, rol: 'recepcion' };
    }

    return { exito: false, error: 'Usuario o contraseña incorrectos' };
  };

  const register = async (datos: DatosRegistro): Promise<ResultadoAuth> => {
    const usuario = `${datos.nombre.trim().toLowerCase()}.${datos.apellido.trim().toLowerCase()}`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: datos.email.trim(),
      password: datos.contrasena,
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return { exito: false, error: 'Ya existe una cuenta registrada con este correo.' };
      }
      return { exito: false, error: 'No se pudo crear la cuenta: ' + authError.message };
    }

    if (!authData.user) {
      return { exito: false, error: 'No se pudo crear la cuenta, intenta de nuevo' };
    }

    const { error: perfilError } = await supabase.from('perfiles').insert({
      id: authData.user.id,
      rol: 'paciente',
      usuario,
      email: datos.email.trim(),
      nombre: `${datos.nombre.trim()} ${datos.apellido.trim()}`,
      telefono: datos.telefono.trim() || null,
      fecha_nacimiento: datos.fechaNacimiento,
      identidad: datos.identidad.trim(),
    });

    if (perfilError) {
      return { exito: false, error: 'La cuenta se creó pero hubo un error guardando el perfil: ' + perfilError.message };
    }

    setUser({
      rol: 'paciente',
      id: authData.user.id,
      nombre: `${datos.nombre.trim()} ${datos.apellido.trim()}`,
      usuario,
      edad: calcularEdad(datos.fechaNacimiento),
      telefono: datos.telefono.trim(),
    });

    return { exito: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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