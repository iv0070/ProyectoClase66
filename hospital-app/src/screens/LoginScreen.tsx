import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';

type Role = 'doctor' | 'paciente' | 'recepcion';

interface LoginScreenProps {
  navigation?: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (rol: Role) => {
    if (usuario.trim() === '' || contrasena.trim() === '') {
      setLoginError('Debes ingresar usuario y contraseña');
      return;
    }

    if (contrasena.length < 6) {
      setLoginError('Usuario o contraseña incorrectos');
      return;
    }

    setLoginError('');

    if (navigation) {
      if (rol === 'doctor') navigation.navigate('DoctorStack');
      if (rol === 'paciente') navigation.navigate('PatientTabs');
      if (rol === 'recepcion') navigation.navigate('ReceptionStack');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Sistema Hospitalario</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <CustomInput
          label="Usuario"
          value={usuario}
          onChangeText={setUsuario}
          validationType="text"
          placeholder="tu.usuario"
        />

        <CustomInput
          label="Contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          validationType="password"
          placeholder="••••••••"
        />

        {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

        <Text style={styles.roleLabel}>Entrar como:</Text>

        <CustomButton
          title="Doctor"
          onPress={() => handleLogin('doctor')}
          variant="primary"
          style={styles.roleButton}
        />
        <CustomButton
          title="Paciente"
          onPress={() => handleLogin('paciente')}
          variant="secondary"
          style={styles.roleButton}
        />
        <CustomButton
          title="Recepción"
          onPress={() => handleLogin('recepcion')}
          variant="danger"
          style={styles.roleButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 10,
  },
  roleButton: {
    marginBottom: 10,
  },
});