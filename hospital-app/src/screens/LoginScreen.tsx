import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, TouchableOpacity } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  navigation?: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const { login } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loginError, setLoginError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    setLoginError('');
    setCargando(true);

    const resultado = await login(usuario, contrasena);

    setCargando(false);

    if (!resultado.exito) {
      setLoginError(resultado.error ?? 'Usuario o contraseña incorrectos');
      return;
    }

    // Navegar según el rol que ya quedó guardado en el context
            if (resultado.rol === 'paciente') {
      navigation?.reset({ index: 0, routes: [{ name: 'PatientTabs' }] });
    } else if (resultado.rol === 'doctor') {
      if (resultado.debeCambiarPassword) {
        navigation?.navigate('CambiarPasswordObligatorio', { rolDestino: 'doctor' });
      } else {
        navigation?.reset({ index: 0, routes: [{ name: 'DoctorStack' }] });
      }
    } else if (resultado.rol === 'recepcion') {
      if (resultado.debeCambiarPassword) {
        navigation?.navigate('CambiarPasswordObligatorio', { rolDestino: 'recepcion' });
      } else {
        navigation?.reset({ index: 0, routes: [{ name: 'ReceptionStack' }] });
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} />
        <Text style={styles.title}>Sistema Hospitalario</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <CustomInput label="Usuario" value={usuario} onChangeText={setUsuario} validationType="text" placeholder="tu.usuario" autoCapitalize="none" />
        <CustomInput label="Contraseña" value={contrasena} onChangeText={setContrasena} validationType="password" placeholder="••••••••" />

        {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

        <CustomButton title={cargando ? 'Ingresando...' : 'Iniciar sesión'} onPress={handleLogin} variant="primary" disabled={cargando} loading={cargando} />

        <TouchableOpacity onPress={() => navigation?.navigate('RegistroPaciente')} style={styles.registroContainer} activeOpacity={0.5}>
          <Text style={styles.registroTexto}>¿No tienes una cuenta? <Text style={styles.registroLink}>Regístrate</Text></Text>
        </TouchableOpacity>

        <Text style={styles.hintText}>Prueba con: carla.mejia / Temporal123 (Doctor) · daniel.martinez / Temporal123 (Recepción)</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F9FAFB' },
  logo: { width: 90, height: 90, alignSelf: 'center', marginBottom: 16, borderRadius: 20 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  errorText: { color: '#DC2626', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  registroContainer: { marginTop: 16, alignItems: 'center' },
  registroTexto: { fontSize: 14, color: '#6B7280' },
  registroLink: { color: '#2563EB', fontWeight: '600', textDecorationLine: 'underline' },
  hintText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 16 },
});