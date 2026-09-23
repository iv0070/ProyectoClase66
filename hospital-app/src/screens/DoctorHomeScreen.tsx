import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // NUEVO
import CustomButton from '../components/CustomButtom';
import CustomInput from '../components/CustomInput';
import { supabase } from '../../lib/supabase'; // NUEVO
import { useAuth } from '../context/AuthContext';

interface DoctorHomeScreenProps {
  navigation?: any;
}

//la cita ahora incluye el nombre del paciente, traido con un join
interface CitaConPaciente {
  id: string;
  paciente_id: string;
  doctor_id: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'rechazada';
  paciente: { nombre: string } | null;
}

export default function DoctorHomeScreen({ navigation }: DoctorHomeScreenProps) {
  const { user, logout } = useAuth(); //agregamos logout
  const [citas, setCitas] = useState<CitaConPaciente[]>([]); 
  const [cargando, setCargando] = useState(true); // NUEVO
  const [citaEnReprogramacion, setCitaEnReprogramacion] = useState<string | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [reprogramarError, setReprogramarError] = useState('');

  //trae las citas del doctor desde Supabase, con el nombre del paciente
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

  //recarga las citas cada vez que entras a esta pantalla
  useFocusEffect(
    useCallback(() => {
      cargarCitas();
    }, [cargarCitas])
  );

  //Si por algo no hay usuario logueado, no deberia llegar aqui, pero por seguridad
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>No hay sesión activa</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getNombrePaciente = (cita: CitaConPaciente) => {
    return cita.paciente?.nombre ?? 'Paciente desconocido'; // CAMBIO
  };

  const getColorEstado = (estado: CitaConPaciente['estado']) => {
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

  //ahora actualiza Supabase en vez del estado local
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


  const handleRechazar = (citaId: string) => {
    Alert.alert(
      'Rechazar cita',
      '¿Seguro que quieres rechazar esta cita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('citas')
              .update({ estado: 'rechazada' })
              .eq('id', citaId);

            if (error) {
              Alert.alert('Error', 'No se pudo rechazar la cita');
              return;
            }
            cargarCitas();
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

  //ahora actualiza Supabase en vez del estado local
  const handleConfirmarReprogramacion = async (citaId: string) => {
    if (nuevaFecha.trim() === '' || nuevaHora.trim() === '') {
      setReprogramarError('Debes ingresar fecha y hora nuevas');
      return;
    }

    const { error } = await supabase
      .from('citas')
      .update({ fecha: nuevaFecha, hora: nuevaHora, estado: 'pendiente' })
      .eq('id', citaId);

    if (error) {
      setReprogramarError('No se pudo reprogramar: ' + error.message);
      return;
    }

    setCitaEnReprogramacion(null);
    setNuevaFecha('');
    setNuevaHora('');
    setReprogramarError('');
    cargarCitas();
  };

  //cierra sesion de verdad (Supabase + limpia el user del context)
  const handleCerrarSesion = async () => {
    await logout();
    navigation?.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const renderCita = ({ item }: { item: CitaConPaciente }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.pacienteNombre}>{getNombrePaciente(item)}</Text>
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
            label="Nueva fecha (AAAA-MM-DD)"
            value={nuevaFecha}
            onChangeText={setNuevaFecha}
            validationType="text"
            placeholder="2026-08-28"
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
        <Text style={styles.title}>Hola, {user.nombre}</Text>
        <Text style={styles.subtitle}>Citas de hoy</Text>

        {cargando ? (
          <Text style={styles.emptyText}>Cargando citas...</Text>
        ) : (
          <FlatList
            data={citas}
            keyExtractor={(item) => item.id}
            renderItem={renderCita}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No tienes citas registradas por ahora</Text>
            }
          />
        )}

        <CustomButton
          title="Nueva consulta"
          onPress={() => navigation?.navigate('NuevaConsulta')}
          variant="primary"
        />
        <CustomButton
          title="Ver perfil"
          onPress={() => navigation?.navigate('Perfil')}
          variant="secondary"
          style={{ marginTop: 10 }}
        />
        <CustomButton
          title="Cerrar sesión"
          onPress={handleCerrarSesion}
          variant="danger"
          style={{ marginTop: 10 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 4, marginBottom: 16 },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pacienteNombre: { fontSize: 16, fontWeight: '600', color: '#111827' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  hora: { fontSize: 13, color: '#6B7280', marginTop: 6 },
  accionesRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  accionButton: { flex: 1 },
  reprogramarButton: { marginTop: 10 },
  reprogramarBox: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 10 },
  errorText: { color: '#DC2626', fontSize: 14, marginBottom: 8, textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
});