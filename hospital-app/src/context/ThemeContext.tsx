import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { coloresClaro, coloresOscuro, Colores } from '../theme/colors';

export type Tema = 'claro' | 'oscuro';

interface ThemeContextType {
  tema: Tema;
  colores: Colores;
  toggleTema: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@tema_preferido';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>('claro');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((valor) => {
      if (valor === 'claro' || valor === 'oscuro') {
        setTema(valor);
      }
    });
  }, []);

  const toggleTema = () => {
    const nuevoTema: Tema = tema === 'claro' ? 'oscuro' : 'claro';
    setTema(nuevoTema);
    AsyncStorage.setItem(STORAGE_KEY, nuevoTema);
  };

  const colores = tema === 'claro' ? coloresClaro : coloresOscuro;

  return (
    <ThemeContext.Provider value={{ tema, colores, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
}