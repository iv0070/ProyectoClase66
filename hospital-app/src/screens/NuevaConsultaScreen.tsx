import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, FlatList } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { citas, pacientes, doctores, consultas } from '../data/mockData';
import { Cita, Consulta } from '../types';

interface NuevaConsultaScreenProps {
  navigation?: any;
}

const doctorActual = doctores[1];

export default function NuevaConsultaScreen({ navigation }: NuevaConsultaScreenProps) {
  const citasConfirmadas = citas.filter(
    (c) => c.doctorId === doctorActual.id && c.estado === 'confirmada'
  );

  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [medicamento, setMedicamento] = useState('');
  const [formError, setFormError] = useState('');

  const getNombrePaciente = (pacienteId: string) => {
    const paciente = pacientes.find((p) => p.id === pacienteId);
    return paciente ? paciente.nombre : 'Paciente desconocido';
  };

  const handleSeleccionarCita = (cita: Cita) => {
    setCitaSeleccionada(cita);
    setFecha(cita.fecha);
    setHora(cita.hora);
    setFormError('');
  };

  const handleGenerar = () => {
    if (!citaSeleccionada) {
      setFormError('Debes elegir para qué paciente es la consulta');
      return;
    }

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

    // Crear la consulta y guardarla
    const nuevaConsulta: Consulta = {
      id: `con${Date.now()}`,
      citaId: citaSeleccionada.id,
      pacienteId: citaSeleccionada.pacienteId,
      doctorId: doctorActual.id,
      fecha,
      hora,
      sintomas,
      diagnostico,
      medicamento,
    };
    consultas.push(nuevaConsulta);

    // Marcar la cita como completada
    const citaEnArray = citas.find((c) => c.id === citaSeleccionada.id);
    if (citaEnArray) {
      citaEnArray.estado = 'completada';
    }

    navigation?.navigate('Documento', {
      pacienteId: citaSeleccionada.pacienteId,
      pacienteNombre: getNombrePaciente(citaSeleccionada.pacienteId),
      citaId: citaSeleccionada.id,
      fecha,
      hora,
      sintomas,
      diagnostico,
      medicamento,
    });
  };

  const renderCitaOption = ({ item }: { item: Cita }) => {
    const seleccionada = citaSeleccionada?.id === item.id;
    return (
      <CustomButton
        title={`${getNombrePaciente(item.pacienteId)} · ${item.fecha} ${item.hora}`}
        onPress={() => handleSeleccionarCita(item)}
        variant={seleccionada ? 'primary' : 'secondary'}
        style={styles.citaButton}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Nueva consulta</Text>
        <Text style={styles.subtitle}>Elige el paciente (cita confirmada)</Text>

        <FlatList
          data={citasConfirmadas}
          keyExtractor={(item) => item.id}
          renderItem={renderCitaOption}
          style={styles.citasList}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes citas confirmadas por ahora</Text>
          }
        />

        {citaSeleccionada && (
          <>
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
          </>
        )}

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
    marginBottom: 12,
  },
  citasList: {
    maxHeight: 160,
    marginBottom: 16,
  },
  citaButton: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginVertical: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
});