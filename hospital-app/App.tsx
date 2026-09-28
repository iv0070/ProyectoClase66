import React from 'react';
import RootNavigator from './src/navigation/RootNavigation';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (
     <ThemeProvider>
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
    </ThemeProvider>
  );
}