import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { supabase } from '../../lib/supabase';


interface RegistroPacienteScreenProps {
  navigation?: any;
}

export default function RegistroPacienteScreen({ navigation }: RegistroPacienteScreenProps) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [identidad, setIdentidad] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleRegistro = async () => {
    if (!nombre.trim() || !apellido.trim() || !edad.trim() || !contrasena.trim()) {
      setError('Nombre, apellido, edad y contraseña son obligatorios');
      return;
    }

    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const edadNumero = parseInt(edad, 10);
    if (isNaN(edadNumero) || edadNumero <= 0) {
      setError('Ingresa una edad válida');
      return;
    }

    setError('');
    setCargando(true);

    const usuario = `${nombre.trim().toLowerCase()}.${apellido.trim().toLowerCase()}`;
    const correoSimulado = `${usuario}@hospital.local`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: correoSimulado,
      password: contrasena,
    });

    if (authError) {
      setCargando(false);
      if (authError.message.includes('already registered')) {
        setError('Ese usuario ya existe, elige otro nombre o apellido');
      } else {
        setError('No se pudo crear la cuenta: ' + authError.message);
      }
      return;
    }

    if (!authData.user) {
      setCargando(false);
      setError('No se pudo crear la cuenta, intenta de nuevo');
      return;
    }

    const { error: perfilError } = await supabase.from('perfiles').insert({
      id: authData.user.id,
      rol: 'paciente',
      nombre: `${nombre.trim()} ${apellido.trim()}`,
      telefono: telefono.trim() || null,
      edad: edadNumero,
      identidad: identidad.trim() || null,
    });

    setCargando(false);

    if (perfilError) {
      setError('La cuenta se creó pero hubo un error guardando el perfil: ' + perfilError.message);
      return;
    }

    Alert.alert(
      'Cuenta creada',
      `Tu usuario es: ${usuario}\nGuárdalo para iniciar sesión.`,
      [{ text: 'OK', onPress: () => navigation?.navigate('Login') }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Crear cuenta de paciente</Text>
        <Text style={styles.subtitle}>Tu usuario se generará como nombre.apellido</Text>

        <CustomInput label="Nombre" value={nombre} onChangeText={setNombre} validationType="text" placeholder="Ashly" />
        <CustomInput label="Apellido" value={apellido} onChangeText={setApellido} validationType="text" placeholder="Cruz" />
        <CustomInput label="Edad" value={edad} onChangeText={setEdad} validationType="text" placeholder="34" />
        <CustomInput label="Teléfono" value={telefono} onChangeText={setTelefono} validationType="text" placeholder="3315-5249" />
        <CustomInput label="Número de identidad" value={identidad} onChangeText={setIdentidad} validationType="text" placeholder="0501-1992-00123" />
        <CustomInput label="Contraseña" value={contrasena} onChangeText={setContrasena} validationType="password" placeholder="••••••••" />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <CustomButton
          title={cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          onPress={handleRegistro}
          variant="primary"
          disabled={cargando}
          loading={cargando}
        />

        <CustomButton
          title="Ya tengo cuenta, iniciar sesión"
          onPress={() => navigation?.navigate('Login')}
          variant="secondary"
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F9FAFB' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  errorText: { color: '#DC2626', fontSize: 14, marginBottom: 12, textAlign: 'center' },
});