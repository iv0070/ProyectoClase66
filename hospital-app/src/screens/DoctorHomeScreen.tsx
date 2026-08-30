import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Alert } from 'react-native';
import CustomButton from '../components/CustomButtom';
import CustomInput from '../components/CustomInput';
import { citas as citasIniciales, pacientes, doctores } from '../data/mockData';
import { Cita } from '../types';

interface DoctorHomeScreenProps {
  navigation?: any;
}

const doctorActual = doctores[1];

export default function DoctorHomeScreen({ navigation }: DoctorHomeScreenProps) {
  const [citas, setCitas] = useState<Cita[]>(citasIniciales);
  const [citaEnReprogramacion, setCitaEnReprogramacion] = useState<string | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [reprogramarError, setReprogramarError] = useState('');

  const citasDelDoctor = citas.filter((c) => c.doctorId === doctorActual.id);

  const getNombrePaciente = (pacienteId: string) => {
    const paciente = pacientes.find((p) => p.id === pacienteId);
    return paciente ? paciente.nombre : 'Paciente desconocido';
  };

  const getColorEstado = (estado: Cita['estado']) => {
    switch (estado) {
      case 'pendiente':
        return '#F59E0B';
      case 'confirmada':
        return '#2563EB';
      case 'completada':
        return '#059669';
      case 'rechazada':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const handleConfirmar = (citaId: string) => {
    setCitas((prev) =>
      prev.map((c) => (c.id === citaId ? { ...c, estado: 'confirmada' } : c))
    );
  };

  const handleRechazar = (citaId: string) => {
    Alert.alert(
      'Rechazar cita',
      '¿Seguro que quieres rechazar esta cita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: () => {
            setCitas((prev) =>
              prev.map((c) => (c.id === citaId ? { ...c, estado: 'rechazada' } : c))
            );
          },
        },
      ]
    );
  };

  const handleAbrirReprogramar = (citaId: string) => {
    setCitaEnReprogramacion(citaId);
    setNuevaFecha('');
    setNuevaHora('');
    setReprogramarError('');
  };

  const handleCancelarReprogramar = () => {
    setCitaEnReprogramacion(null);
    setNuevaFecha('');
    setNuevaHora('');
    setReprogramarError('');
  };

  const handleConfirmarReprogramacion = (citaId: string) => {
    if (nuevaFecha.trim() === '' || nuevaHora.trim() === '') {
      setReprogramarError('Debes ingresar fecha y hora nuevas');
      return;
    }

    setCitas((prev) =>
      prev.map((c) =>
        c.id === citaId
          ? { ...c, fecha: nuevaFecha, hora: nuevaHora, estado: 'pendiente' }
          : c
      )
    );

    setCitaEnReprogramacion(null);
    setNuevaFecha('');
    setNuevaHora('');
    setReprogramarError('');
  };

  const renderCita = ({ item }: { item: Cita }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.pacienteNombre}>{getNombrePaciente(item.pacienteId)}</Text>
        <View style={[styles.badge, { backgroundColor: getColorEstado(item.estado) }]}>
          <Text style={styles.badgeText}>{item.estado}</Text>
        </View>
      </View>
      <Text style={styles.hora}>{item.fecha} · {item.hora}</Text>

      {item.estado === 'pendiente' && (
        <View style={styles.accionesRow}>
          <CustomButton
            title="Confirmar"
            onPress={() => handleConfirmar(item.id)}
            variant="primary"
            style={styles.accionButton}
          />
          <CustomButton
            title="Rechazar"
            onPress={() => handleRechazar(item.id)}
            variant="danger"
            style={styles.accionButton}
          />
        </View>
      )}

      {item.estado === 'rechazada' && citaEnReprogramacion !== item.id && (
        <CustomButton
          title="Reprogramar"
          onPress={() => handleAbrirReprogramar(item.id)}
          variant="secondary"
          style={styles.reprogramarButton}
        />
      )}

      {citaEnReprogramacion === item.id && (
        <View style={styles.reprogramarBox}>
          <CustomInput
            label="Nueva fecha (DD/MM/AAAA)"
            value={nuevaFecha}
            onChangeText={setNuevaFecha}
            validationType="text"
            placeholder="28/08/2026"
          />
          <CustomInput
            label="Nueva hora"
            value={nuevaHora}
            onChangeText={setNuevaHora}
            validationType="text"
            placeholder="09:00 AM"
          />
          {reprogramarError ? (
            <Text style={styles.errorText}>{reprogramarError}</Text>
          ) : null}
          <View style={styles.accionesRow}>
            <CustomButton
              title="Confirmar nueva fecha"
              onPress={() => handleConfirmarReprogramacion(item.id)}
              variant="primary"
              style={styles.accionButton}
            />
            <CustomButton
              title="Cancelar"
              onPress={handleCancelarReprogramar}
              variant="secondary"
              style={styles.accionButton}
            />
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Hola, {doctorActual.nombre}</Text>
        <Text style={styles.subtitle}>Citas de hoy</Text>

        <FlatList
          data={citasDelDoctor}
          keyExtractor={(item) => item.id}
          renderItem={renderCita}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes citas registradas por ahora</Text>
          }
        />

        <CustomButton
          title="Nueva consulta"
          onPress={() => navigation?.navigate('NuevaConsulta')}
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
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pacienteNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  hora: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  },
  accionesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  accionButton: {
    flex: 1,
  },
  reprogramarButton: {
    marginTop: 10,
  },
  reprogramarBox: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
  },
});