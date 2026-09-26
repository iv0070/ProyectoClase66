import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { supabase } from '../../lib/supabase';

interface NuevoPacienteScreenProps {
  navigation?: any;
}

const PASSWORD_TEMPORAL = 'Temporal123';

export default function NuevoPacienteScreen({ navigation }: NuevoPacienteScreenProps) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(''); // DD/MM/AAAA
  const [telefono, setTelefono] = useState('');
  const [identidad, setIdentidad] = useState('');
  const [formError, setFormError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleCrear = async () => {
    if (
      nombre.trim() === '' ||
      email.trim() === '' ||
      fechaNacimiento.trim() === '' ||
      telefono.trim() === '' ||
      identidad.trim() === ''
    ) {
      setFormError('Todos los campos son obligatorios');
      return;
    }

    const partesNombre = nombre.trim().split(/\s+/);
    if (partesNombre.length < 2) {
      setFormError('Ingresa el nombre completo (nombre y apellido)');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Ingresa un correo electrónico válido');
      return;
    }

    // DD/MM/AAAA -> AAAA-MM-DD (formato que espera Supabase)
    const partesFecha = fechaNacimiento.trim().split('/');
    if (partesFecha.length !== 3) {
      setFormError('La fecha de nacimiento debe tener el formato DD/MM/AAAA');
      return;
    }
    const [dia, mes, anio] = partesFecha;
    const fechaISO = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

    setFormError('');
    setCargando(true);

    const usuario = nombre.trim().toLowerCase().replace(/\s+/g, '.');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: PASSWORD_TEMPORAL,
    });

    if (authError) {
      setCargando(false);
      if (authError.message.includes('already registered')) {
        setFormError('Ya existe una cuenta registrada con ese correo');
      } else {
        setFormError('No se pudo crear la cuenta: ' + authError.message);
      }
      return;
    }

    if (!authData.user) {
      setCargando(false);
      setFormError('No se pudo crear la cuenta, intenta de nuevo');
      return;
    }

    const { error: perfilError } = await supabase.from('perfiles').insert({
      id: authData.user.id,
      rol: 'paciente',
      usuario,
      email: email.trim(),
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      fecha_nacimiento: fechaISO,
      identidad: identidad.trim(),
      debe_cambiar_password: true,
    });

    setCargando(false);

    if (perfilError) {
      setFormError('La cuenta se creó pero hubo un error guardando el perfil: ' + perfilError.message);
      return;
    }

    Alert.alert(
      'Paciente creado',
      `${nombre.trim()} fue registrado correctamente.\n\nUsuario: ${usuario}\nContraseña temporal: ${PASSWORD_TEMPORAL}\n\nSe cerró tu sesión de recepción, deberás iniciar sesión de nuevo.`,
      [
        {
          text: 'OK',
          onPress: () => navigation?.reset({ index: 0, routes: [{ name: 'Login' }] }),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Nuevo paciente</Text>
        <Text style={styles.subtitle}>Registra los datos basicos</Text>

        <CustomInput
          label="Nombre completo"
          value={nombre}
          onChangeText={setNombre}
          validationType="text"
          placeholder="Nombre y apellido"
        />

        <CustomInput
          label="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          validationType="email"
          placeholder="paciente@ejemplo.com"
        />

        <CustomInput
          label="Número de identidad"
          value={identidad}
          onChangeText={setIdentidad}
          validationType="text"
          placeholder="0501-1990-00000"
        />

        <CustomInput
          label="Fecha de nacimiento (DD/MM/AAAA)"
          value={fechaNacimiento}
          onChangeText={setFechaNacimiento}
          validationType="text"
          placeholder="15/03/1990"
        />

        <CustomInput
          label="Teléfono"
          value={telefono}
          onChangeText={setTelefono}
          validationType="text"
          placeholder="9999-0000"
        />

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <CustomButton
          title={cargando ? 'Creando...' : 'Crear paciente'}
          onPress={handleCrear}
          variant="primary"
          disabled={cargando}
          loading={cargando}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 4, marginBottom: 20 },
  errorText: { color: '#DC2626', fontSize: 14, marginBottom: 12, textAlign: 'center' },
});