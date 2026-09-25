import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomButton from '../components/CustomButtom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface PacienteHomeScreenProps {
  navigation?: any;
}

type Estado = 'pendiente' | 'confirmada' | 'completada' | 'rechazada' | 'cancelada';

interface CitaConDoctor {
  id: string;
  fecha: string;
  hora: string;
  estado: Estado;
  motivo: string | null;
  doctor: { nombre: string } | null;
}

export default function PacienteHomeScreen({ navigation }: PacienteHomeScreenProps) {
  const { user } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre ?? '...');
  const [citas, setCitas] = useState<CitaConDoctor[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setCargando(false);
      return;
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('nombre')
      .eq('id', authUser.id)
      .single();
    if (perfil) setNombre(perfil.nombre);

    const { data, error } = await supabase
      .from('citas')
      .select('id, fecha, hora, estado, motivo, doctor:perfiles!doctor_id(nombre)')
      .eq('paciente_id', authUser.id)
      .in('estado', ['pendiente', 'confirmada'])
      .order('fecha', { ascending: true });

    if (!error && data) {
      setCitas(data as unknown as CitaConDoctor[]);
    }
    setCargando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos])
  );

  const getColorEstado = (estado: Estado) => {
    switch (estado) {
      case 'pendiente':
        return '#F59E0B';
      case 'confirmada':
        return '#2563EB';
      default:
        return '#6B7280';
    }
  };

  const handleCancelar = (citaId: string) => {
    Alert.alert(
      'Cancelar cita',
      '¿Seguro que quieres cancelar esta cita?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('citas')
              .update({ estado: 'cancelada' })
              .eq('id', citaId);

            if (error) {
              Alert.alert('Error', 'No se pudo cancelar la cita: ' + error.message);
              return;
            }
            cargarDatos();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Hola, {nombre}</Text>
        <Text style={styles.subtitle}>¿Qué deseas hacer hoy?</Text>

        <CustomButton
          title="Agendar cita"
          onPress={() => navigation?.navigate('AgendarCita')}
          variant="primary"
          style={styles.button}
        />

        <Text style={styles.seccionTitulo}>Mis próximas citas</Text>

        {cargando ? (
          <Text style={styles.vacio}>Cargando...</Text>
        ) : citas.length === 0 ? (
          <Text style={styles.vacio}>No tienes citas próximas.</Text>
        ) : (
          <FlatList
            data={citas}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardDoctor}>{item.doctor?.nombre ?? 'Doctor'}</Text>
                  <View style={[styles.badge, { backgroundColor: getColorEstado(item.estado) }]}>
                    <Text style={styles.badgeText}>{item.estado}</Text>
                  </View>
                </View>
                <Text style={styles.cardFecha}>{item.fecha} · {item.hora}</Text>
                {item.motivo && <Text style={styles.cardMotivo}>{item.motivo}</Text>}

                <CustomButton
                  title="Cancelar cita"
                  onPress={() => handleCancelar(item.id)}
                  variant="danger"
                  style={styles.cancelarButton}
                />
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24, textAlign: 'center' },
  button: { marginTop: 8 },
  seccionTitulo: { fontSize: 16, fontWeight: '600', color: '#374151', marginTop: 28, marginBottom: 12 },
  vacio: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 12 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDoctor: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cardFecha: { fontSize: 13, color: '#6B7280', marginTop: 6 },
  cardMotivo: { fontSize: 13, color: '#374151', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  cancelarButton: { marginTop: 10 },
});