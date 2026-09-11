import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, TouchableOpacity } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { doctores, recepcionistas } from '../data/mockData';
import { supabase } from '../../lib/supabase';


interface LoginScreenProps {
  navigation?: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loginError, setLoginError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (usuario.trim() === '' || contrasena.trim() === '') {
      setLoginError('Debes ingresar usuario y contraseña');
      return;
    }

    setLoginError('');
    setCargando(true);

    // 1. Buscar el perfil en Supabase por el campo "usuario"
    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('email, rol')
      .eq('usuario', usuario.trim())
      .single();

    if (perfil && !perfilError) {
      // 2. Existe en Supabase: intentar login real con su correo
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: perfil.email,
        password: contrasena,
      });

      setCargando(false);

      if (authError) {
        setLoginError('Usuario o contraseña incorrectos');
        return;
      }

      // 3. Login exitoso, navegar según el rol guardado en Supabase
      if (perfil.rol === 'paciente') {
        navigation?.reset({ index: 0, routes: [{ name: 'PatientTabs' }] });
      } else if (perfil.rol === 'doctor') {
        navigation?.reset({ index: 0, routes: [{ name: 'DoctorStack' }] });
      } else if (perfil.rol === 'recepcion') {
        navigation?.reset({ index: 0, routes: [{ name: 'ReceptionStack' }] });
      }
      return;
    }

    // 4. No existe en Supabase todavía: revisar el mock (temporal, para doctor/recepcion)
    setCargando(false);

    const doctorValido = doctores.find(
      (d) => d.usuario === usuario && d.contrasena === contrasena
    );
    if (doctorValido) {
      navigation?.navigate('DoctorStack');
      return;
    }

    const recepcionistaValido = recepcionistas.find(
      (r) => r.usuario === usuario && r.contrasena === contrasena
    );
    if (recepcionistaValido) {
      navigation?.navigate('ReceptionStack');
      return;
    }

    setLoginError('Usuario o contraseña incorrectos');
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
          autoCapitalize="none"
        />

        <CustomInput
          label="Contraseña"
          value={contrasena}
          onChangeText={setContrasena}
          validationType="password"
          placeholder="••••••••"
        />

        {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

        <CustomButton
          title={cargando ? 'Ingresando...' : 'Iniciar sesión'}
          onPress={handleLogin}
          variant="primary"
          disabled={cargando}
          loading={cargando}
        />

        <TouchableOpacity
          onPress={() => navigation?.navigate('RegistroPaciente')}
          style={styles.registroContainer}
          activeOpacity={0.5}
        >
          <Text style={styles.registroTexto}>
            ¿No tienes una cuenta? <Text style={styles.registroLink}>Regístrate</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.hintText}>
          Prueba con: carla.mejia / 123456 (Doctor) · daniel.martinez / 456123 (Recepción)
        </Text>
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