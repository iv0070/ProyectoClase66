import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CustomButton from '../components/CustomButtom';
import CustomInput from '../components/CustomInput';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface DoctorHomeScreenProps {
  navigation?: any;
}

type Estado = 'pendiente' | 'confirmada' | 'completada' | 'rechazada' | 'cancelada' | 'reprogramacion_sugerida';

interface CitaConPaciente {
  id: string;
  paciente_id: string;
  doctor_id: string;
  fecha: string;
  hora: string;
  estado: Estado;
  motivo: string | null;
  tipo_consulta: string | null;
  fecha_sugerida: string | null;
  hora_sugerida: string | null;
  sugerida_por: string | null;
  paciente: { nombre: string } | null;
}

type FiltroEstado = 'todas' | Estado;

const FILTROS: { key: FiltroEstado; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'confirmada', label: 'Confirmadas' },
  { key: 'completada', label: 'Completadas' },
  { key: 'rechazada', label: 'Rechazadas' },
  { key: 'reprogramacion_sugerida', label: 'Sugeridas' },
];

export default function DoctorHomeScreen({ navigation }: DoctorHomeScreenProps) {
  const { user, logout } = useAuth();
  const [citas, setCitas] = useState<CitaConPaciente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<FiltroEstado>('todas');
  const [citaEnSugerencia, setCitaEnSugerencia] = useState<string | null>(null);
  const [fechaSugerida, setFechaSugerida] = useState('');
  const [horaSugerida, setHoraSugerida] = useState('');
  const [sugerenciaError, setSugerenciaError] = useState('');

  const cargarCitas = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('citas')
      .select('*, paciente:perfiles!paciente_id(nombre)')
      .eq('doctor_id', user.id)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (!error && data) {
      setCitas(data as unknown as CitaConPaciente[]);
    }
    setCargando(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      cargarCitas();
    }, [cargarCitas])
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>No hay sesión activa</Text>
        </View>
      </SafeAreaView>
    );
  }

  const citasFiltradas = filtro === 'todas' ? citas : citas.filter((c) => c.estado === filtro);

  const getNombrePaciente = (cita: CitaConPaciente) => {
    return cita.paciente?.nombre ?? 'Paciente desconocido';
  };

  const getColorEstado = (estado: Estado) => {
    switch (estado) {
      case 'pendiente':
        return '#F59E0B';
      case 'confirmada':
        return '#2563EB';
      case 'completada':
        return '#059669';
      case 'rechazada':
        return '#DC2626';
      case 'cancelada':
        return '#6B7280';
      case 'reprogramacion_sugerida':
        return '#7C3AED';
      default:
        return '#6B7280';
    }
  };

  const handleConfirmar = async (citaId: string) => {
    const { error } = await supabase
      .from('citas')
      .update({ estado: 'confirmada' })
      .eq('id', citaId);

    if (error) {
      Alert.alert('Error', 'No se pudo confirmar la cita');
      return;
    }
    cargarCitas();
  };

  const handleRechazarSinMas = async (citaId: string) => {
    const { error } = await supabase
      .from('citas')
      .update({ estado: 'rechazada' })
      .eq('id', citaId);

    if (error) {
      Alert.alert('Error', 'No se pudo rechazar la cita');
      return;
    }
    cargarCitas();
  };

  const handleRechazar = (citaId: string) => {
    Alert.alert(
      'Rechazar cita',
      '¿Qué deseas hacer?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar sin más',
          style: 'destructive',
          onPress: () => handleRechazarSinMas(citaId),
        },
        {
          text: 'Rechazar y sugerir fecha',
          onPress: () => handleAbrirSugerencia(citaId),
        },
      ]
    );
  };

  const handleAbrirSugerencia = (citaId: string) => {
    setCitaEnSugerencia(citaId);
    setFechaSugerida('');
    setHoraSugerida('');
    setSugerenciaError('');
  };

  const handleCancelarSugerencia = () => {
    setCitaEnSugerencia(null);
    setFechaSugerida('');
    setHoraSugerida('');
    setSugerenciaError('');
  };

  const handleEnviarSugerencia = async (citaId: string) => {
    if (fechaSugerida.trim() === '' || horaSugerida.trim() === '') {
      setSugerenciaError('Debes ingresar fecha y hora sugeridas');
      return;
    }

    const { error } = await supabase
      .from('citas')
      .update({
        estado: 'reprogramacion_sugerida',
        fecha_sugerida: fechaSugerida,
        hora_sugerida: horaSugerida,
        sugerida_por: 'doctor',
      })
      .eq('id', citaId);

    if (error) {
      setSugerenciaError('No se pudo enviar la sugerencia: ' + error.message);
      return;
    }

    setCitaEnSugerencia(null);
    setFechaSugerida('');
    setHoraSugerida('');
    setSugerenciaError('');
    cargarCitas();
  };

  const renderCita = ({ item }: { item: CitaConPaciente }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.pacienteNombre}>{getNombrePaciente(item)}</Text>
        <View style={[styles.badge, { backgroundColor: getColorEstado(item.estado) }]}>
          <Text style={styles.badgeText}>{item.estado.replace('_', ' ')}</Text>
        </View>
      </View>
      <Text style={styles.hora}>{item.fecha} · {item.hora}</Text>

      {item.tipo_consulta && (
        <Text style={styles.tipoConsulta}>
          {item.tipo_consulta === 'primera_vez' ? 'Primera vez' : 'Seguimiento'}
        </Text>
      )}
      {item.motivo && <Text style={styles.motivo}>{item.motivo}</Text>}

      {item.estado === 'reprogramacion_sugerida' && item.fecha_sugerida && (
        <Text style={styles.sugerenciaTexto}>
          Esperando respuesta del paciente: {item.fecha_sugerida} · {item.hora_sugerida}
        </Text>
      )}

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

      {citaEnSugerencia === item.id && (
        <View style={styles.sugerenciaBox}>
          <CustomInput
            label="Fecha sugerida (AAAA-MM-DD)"
            value={fechaSugerida}
            onChangeText={setFechaSugerida}
            validationType="text"
            placeholder="2026-08-28"
          />
          <CustomInput
            label="Hora sugerida"
            value={horaSugerida}
            onChangeText={setHoraSugerida}
            validationType="text"
            placeholder="09:00 AM"
          />
          {sugerenciaError ? (
            <Text style={styles.errorText}>{sugerenciaError}</Text>
          ) : null}
          <View style={styles.accionesRow}>
            <CustomButton
              title="Enviar sugerencia"
              onPress={() => handleEnviarSugerencia(item.id)}
              variant="primary"
              style={styles.accionButton}
            />
            <CustomButton
              title="Cancelar"
              onPress={handleCancelarSugerencia}
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
        <Text style={styles.title}>Hola, {user.nombre}</Text>
        <Text style={styles.subtitle}>Citas de hoy</Text>

        <View style={styles.filtrosRow}>
          {FILTROS.map((f) => {
            const activo = filtro === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, activo && styles.chipActivo]}
                onPress={() => setFiltro(f.key)}
              >
                <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {cargando ? (
          <Text style={styles.emptyText}>Cargando citas...</Text>
        ) : (
          <FlatList
            data={citasFiltradas}
            keyExtractor={(item) => item.id}
            renderItem={renderCita}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay citas en este filtro</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 4, marginBottom: 12 },
  filtrosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff' },
  chipActivo: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipTexto: { fontSize: 13, color: '#374151' },
  chipTextoActivo: { color: '#fff', fontWeight: '600' },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pacienteNombre: { fontSize: 16, fontWeight: '600', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  hora: { fontSize: 13, color: '#6B7280', marginTop: 6 },
  tipoConsulta: { fontSize: 12, color: '#2563EB', marginTop: 4, fontWeight: '600' },
  motivo: { fontSize: 13, color: '#374151', marginTop: 4 },
  sugerenciaTexto: { fontSize: 13, color: '#7C3AED', marginTop: 6, fontWeight: '600' },
  accionesRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  accionButton: { flex: 1 },
  sugerenciaBox: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 10 },
  errorText: { color: '#DC2626', fontSize: 14, marginBottom: 8, textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
});