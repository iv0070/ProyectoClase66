import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { pacientes } from '../data/mockData';

interface NuevoPacienteScreenProps {
  navigation?: any;
}

export default function NuevoPacienteScreen({ navigation }: NuevoPacienteScreenProps) {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [identidad, setIdentidad] = useState('');
  const [formError, setFormError] = useState('');

  const handleCrear = () => {
    if (
      nombre.trim() === '' ||
      edad.trim() === '' ||
      telefono.trim() === '' ||
      identidad.trim() === ''
    ) {
      setFormError('Todos los campos son obligatorios');
      return;
    }

    if (isNaN(Number(edad))) {
      setFormError('La edad debe ser un número');
      return;
    }

    const yaExiste = pacientes.some((p) => p.identidad === identidad.trim());
    if (yaExiste) {
      setFormError('Ya existe un paciente registrado con esa identidad');
      return;
    }

    setFormError('');

    Alert.alert(
      'Paciente creado',
      `${nombre} fue registrado correctamente`,
      [
        {
          text: 'OK',
          onPress: () => navigation?.navigate('ReceptionHome'),
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
          label="Número de identidad"
          value={identidad}
          onChangeText={setIdentidad}
          validationType="text"
          placeholder="0501-1990-00000"
        />

        <CustomInput
          label="Edad"
          value={edad}
          onChangeText={setEdad}
          validationType="text"
          placeholder="Edad"
          keyboardType="numeric"
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
          title="Crear paciente"
          onPress={handleCrear}
          variant="primary"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
});