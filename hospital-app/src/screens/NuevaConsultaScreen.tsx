import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';

interface NuevaConsultaScreenProps {
  navigation?: any;
}

export default function NuevaConsultaScreen({ navigation }: NuevaConsultaScreenProps) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [medicamento, setMedicamento] = useState('');
  const [formError, setFormError] = useState('');

  const handleGenerar = () => {
    if (
      fecha.trim() === '' ||
      hora.trim() === '' ||
      sintomas.trim() === '' ||
      diagnostico.trim() === '' ||
      medicamento.trim() === ''
    ) {
      setFormError('Todos los campos son obligatorios');
      return;
    }

    setFormError('');

    navigation?.navigate('Documento', {
      fecha,
      hora,
      sintomas,
      diagnostico,
      medicamento,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Nueva consulta</Text>
        <Text style={styles.subtitle}>Registra los datos de la consulta</Text>

        <CustomInput
          label="Fecha (DD/MM/AAAA)"
          value={fecha}
          onChangeText={setFecha}
          validationType="text"
          placeholder="27/08/2026"
        />

        <CustomInput
          label="Hora"
          value={hora}
          onChangeText={setHora}
          validationType="text"
          placeholder="09:00 AM"
        />

        <CustomInput
          label="Síntomas"
          value={sintomas}
          onChangeText={setSintomas}
          validationType="text"
          placeholder="Describe los síntomas"
          multiline
        />

        <CustomInput
          label="Diagnóstico"
          value={diagnostico}
          onChangeText={setDiagnostico}
          validationType="text"
          placeholder="Diagnóstico médico"
          multiline
        />

        <CustomInput
          label="Medicamento"
          value={medicamento}
          onChangeText={setMedicamento}
          validationType="text"
          placeholder="Medicamento recetado"
        />

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <CustomButton
          title="Generar documentos"
          onPress={handleGenerar}
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