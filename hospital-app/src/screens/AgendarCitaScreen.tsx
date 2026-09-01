import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { doctores, citas, pacientes } from '../data/mockData';
import { Doctor, Cita } from '../types';

interface AgendarCitaScreenProps {
  navigation?: any;
  route?: any;
}

const nombresEspecialidad: Record<string, string> = {
  odontologia: 'Odontología',
  pediatria: 'Pediatría',
  ortopedia: 'Ortopedia',
  cirugia: 'Cirugía',
  medicina_general: 'Medicina General',
  psicologia: 'Psicología',
  fisioterapia: 'Fisioterapia',
};

export default function AgendarCitaScreen({ navigation, route }: AgendarCitaScreenProps) {
  const pacienteIdParam = route?.params?.pacienteId;
  const pacienteNombreParam = route?.params?.pacienteNombre;

  // Si viene de Recepción (con un paciente elegido), se usa ese.
  // Si no, se asume que el propio paciente está agendando su cita.
  const pacienteId = pacienteIdParam ?? pacientes[0].id;
  const pacienteNombre = pacienteNombreParam ?? pacientes[0].nombre;

  const [doctorSeleccionado, setDoctorSeleccionado] = useState<Doctor | null>(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [formError, setFormError] = useState('');

  const handleAgendar = () => {
    if (!doctorSeleccionado) {
      setFormError('Debes elegir un doctor');
      return;
    }

    if (fecha.trim() === '' || hora.trim() === '') {
      setFormError('Debes ingresar fecha y hora');
      return;
    }

    setFormError('');

    // Crear la cita y guardarla
    const nuevaCita: Cita = {
      id: `c${Date.now()}`,
      pacienteId,
      doctorId: doctorSeleccionado.id,
      fecha,
      hora,
      estado: 'pendiente',
    };
    citas.push(nuevaCita);

       Alert.alert(
      'Cita agendada',
      `La cita de ${pacienteNombre} con ${doctorSeleccionado.nombre} quedó en estado pendiente, esperando confirmación.`,
      [
        {
          text: 'OK',
          onPress: () => navigation?.goBack(),
        },
      ]
    );
  };

  const renderDoctor = ({ item }: { item: Doctor }) => {
    const seleccionado = doctorSeleccionado?.id === item.id;
    return (
      <CustomButton
        title={`${item.nombre} · ${nombresEspecialidad[item.especialidad]}`}
        onPress={() => setDoctorSeleccionado(item)}
        variant={seleccionado ? 'primary' : 'secondary'}
        style={styles.doctorButton}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Agendar cita</Text>
        <Text style={styles.subtitle}>Para {pacienteNombre} · Elige un doctor</Text>

        <FlatList
          data={doctores}
          keyExtractor={(item) => item.id}
          renderItem={renderDoctor}
          style={styles.doctorList}
        />

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

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <CustomButton
          title="Agendar cita"
          onPress={handleAgendar}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
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
  doctorList: {
    maxHeight: 180,
    marginBottom: 16,
  },
  doctorButton: {
    marginBottom: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
});