import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomButton from '../components/CustomButtom';
import CustomInput from '../components/CustomInput';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface PacienteHomeScreenProps {
  navigation?: any;
}

type Estado = 'pendiente' | 'confirmada' | 'completada' | 'rechazada' | 'cancelada' | 'reprogramacion_sugerida';

interface CitaConDoctor {
  id: string;
  fecha: string;
  hora: string;
  estado: Estado;
  motivo: string | null;
  fecha_sugerida: string | null;
  hora_sugerida: string | null;
  doctor: { nombre: string } | null;
}

export default function PacienteHomeScreen({ navigation }: PacienteHomeScreenProps) {
  const { colores } = useTheme();
  const { user } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre ?? '...');
  const [citas, setCitas] = useState<CitaConDoctor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [citaEnReprogramacion, setCitaEnReprogramacion] = useState<string | null>(null);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [reprogramarError, setReprogramarError] = useState('');

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
      .select('id, fecha, hora, estado, motivo, fecha_sugerida, hora_sugerida, doctor:perfiles!doctor_id(nombre)')
      .eq('paciente_id', authUser.id)
      .in('estado', ['pendiente', 'confirmada', 'rechazada', 'reprogramacion_sugerida'])
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
      case 'rechazada':
        return '#DC2626';
      case 'reprogramacion_sugerida':
        return '#7C3AED';
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

  const handleAceptarSugerencia = async (cita: CitaConDoctor) => {
    if (!cita.fecha_sugerida || !cita.hora_sugerida) return;

    const { error } = await supabase
      .from('citas')
      .update({
        fecha: cita.fecha_sugerida,
        hora: cita.hora_sugerida,
        estado: 'pendiente',
        fecha_sugerida: null,
        hora_sugerida: null,
        sugerida_por: null,
      })
      .eq('id', cita.id);

    if (error) {
      Alert.alert('Error', 'No se pudo aceptar la sugerencia: ' + error.message);
      return;
    }
    cargarDatos();
  };

  const handleRechazarSugerencia = async (citaId: string) => {
    const { error } = await supabase
      .from('citas')
      .update({
        estado: 'rechazada',
        fecha_sugerida: null,
        hora_sugerida: null,
        sugerida_por: null,
      })
      .eq('id', citaId);

    if (error) {
      Alert.alert('Error', 'No se pudo rechazar la sugerencia: ' + error.message);
      return;
    }
    cargarDatos();
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
    cargarDatos();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colores.fondo }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colores.texto }]}>Hola, {nombre}</Text>
        <Text style={[styles.subtitle, { color: colores.textoSecundario }]}>¿Qué deseas hacer hoy?</Text>

        <CustomButton
          title="Agendar cita"
          onPress={() => navigation?.navigate('AgendarCita')}
          variant="primary"
          style={styles.button}
        />

        <Text style={[styles.seccionTitulo, { color: colores.textoSecundario }]}>Mis citas</Text>

        {cargando ? (
          <Text style={[styles.vacio, { color: colores.textoSecundario }]}>Cargando...</Text>
        ) : citas.length === 0 ? (
          <Text style={[styles.vacio, { color: colores.textoSecundario }]}>No tienes citas registradas.</Text>
        ) : (
          <FlatList
            data={citas}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: colores.fondoCard, borderColor: colores.borde }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardDoctor, { color: colores.texto }]}>{item.doctor?.nombre ?? 'Doctor'}</Text>
                  <View style={[styles.badge, { backgroundColor: getColorEstado(item.estado) }]}>
                    <Text style={styles.badgeText}>{item.estado.replace('_', ' ')}</Text>
                  </View>
                </View>
                <Text style={[styles.cardFecha, { color: colores.textoSecundario }]}>{item.fecha} · {item.hora}</Text>
                {item.motivo && <Text style={[styles.cardMotivo, { color: colores.textoSecundario }]}>{item.motivo}</Text>}

                {item.estado === 'reprogramacion_sugerida' && (
                  <View style={[styles.sugerenciaBox, { borderTopColor: colores.borde }]}>
                    <Text style={styles.sugerenciaTexto}>
                      El doctor propuso: {item.fecha_sugerida} · {item.hora_sugerida}
                    </Text>
                    <View style={styles.accionesRow}>
                      <CustomButton
                        title="Aceptar"
                        onPress={() => handleAceptarSugerencia(item)}
                        variant="primary"
                        style={styles.accionButton}
                      />
                      <CustomButton
                        title="Rechazar"
                        onPress={() => handleRechazarSugerencia(item.id)}
                        variant="danger"
                        style={styles.accionButton}
                      />
                    </View>
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
                  <View style={[styles.reprogramarBox, { borderTopColor: colores.borde }]}>
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

                {(item.estado === 'pendiente' || item.estado === 'confirmada') && (
                  <CustomButton
                    title="Cancelar cita"
                    onPress={() => handleCancelar(item.id)}
                    variant="danger"
                    style={styles.cancelarButton}
                  />
                )}
              </View>
            )}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    padding: 20
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center'
  },

  subtitle: {
    fontSize: 15,
    marginBottom: 24,
    textAlign: 'center'
  },

  button: {
    marginTop: 8
  },

  seccionTitulo: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 28,
    marginBottom: 12
  },

  vacio: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12
  },

  card: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  cardDoctor: {
    fontSize: 15,
    fontWeight: '600',
  },

  cardFecha: {
    fontSize: 13,
    marginTop: 6
  },

  cardMotivo: {
    fontSize: 13,
    marginTop: 4
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },

  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize'
  },

  sugerenciaBox: {
    marginTop: 10,
    borderTopWidth: 1,
    paddingTop: 10
  },

  sugerenciaTexto: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
    marginBottom: 8
  },

  reprogramarButton: {
    marginTop: 10
  },

  reprogramarBox: {
    marginTop: 10,
    borderTopWidth: 1,
    paddingTop: 10
  },

  accionesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },

  accionButton: {
    flex: 1
  },

  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center'
  },

  cancelarButton: {
    marginTop: 10
  },
});