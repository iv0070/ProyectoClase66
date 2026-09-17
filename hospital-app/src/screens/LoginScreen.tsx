import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { doctores, pacientes, recepcionistas } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

type Role = 'doctor' | 'paciente' | 'recepcion';

interface LoginScreenProps {
  navigation?: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (rol: Role) => {
    if (usuario.trim() === '' || contrasena.trim() === '') {
      setLoginError('Debes ingresar usuario y contraseña');
      return;
    }

    if (rol === 'doctor') {
      const doctorValido = doctores.find(
        (d) => d.usuario === usuario && d.contrasena === contrasena
      );
      if (!doctorValido) {
        setLoginError('Usuario o contraseña incorrectos');
        return;
      }
      setLoginError('');
      login({
        rol: 'doctor',
        id: doctorValido.id,
        nombre: doctorValido.nombre,
        usuario: doctorValido.usuario,
        especialidad: doctorValido.especialidad,
      });
      navigation?.navigate('DoctorStack');
      return;
    }

    if (rol === 'paciente') {
      const pacienteValido = pacientes.find(
        (p) => p.usuario === usuario && p.contrasena === contrasena
      );
      if (!pacienteValido) {
        setLoginError('Usuario o contraseña incorrectos');
        return;
      }
      setLoginError('');
      login({
        rol: 'paciente',
        id: pacienteValido.id,
        nombre: pacienteValido.nombre,
        usuario: pacienteValido.usuario,
        edad: pacienteValido.edad,
        telefono: pacienteValido.telefono,
      });
      navigation?.navigate('PatientTabs');
      return;
    }

    if (rol === 'recepcion') {
      const recepcionistaValido = recepcionistas.find(
        (r) => r.usuario === usuario && r.contrasena === contrasena
      );
      if (!recepcionistaValido) {
        setLoginError('Usuario o contraseña incorrectos');
        return;
      }
      setLoginError('');
      login({
        rol: 'recepcion',
        id: recepcionistaValido.id,
        nombre: recepcionistaValido.nombre,
        usuario: recepcionistaValido.usuario,
      });
      navigation?.navigate('ReceptionStack');
      return;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
        />

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
  logo: {
    width: 90,
    height: 90,
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 20,
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