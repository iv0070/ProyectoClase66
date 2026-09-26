import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface HistorialPacienteScreenProps {
  navigation?: any;
  route?: any;
}

interface ConsultaHistorial {
  id: string;
  fecha: string;
  hora: string;
  sintomas: string;
  diagnostico: string;
  medicamento: string;
  notas: string | null;
}

export default function HistorialPacienteScreen({ route }: HistorialPacienteScreenProps) {
  const { user } = useAuth();
  const pacienteId = route?.params?.pacienteId;
  const pacienteNombre = route?.params?.pacienteNombre ?? 'Paciente';

  const [consultas, setConsultas] = useState<ConsultaHistorial[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarHistorial = useCallback(async () => {
    if (!user || !pacienteId) return;

    const { data, error } = await supabase
      .from('consultas')
      .select('id, fecha, hora, sintomas, diagnostico, medicamento, notas')
      .eq('paciente_id', pacienteId)
      .eq('doctor_id', user.id)
      .order('fecha', { ascending: false });

    if (!error && data) {
      setConsultas(data as ConsultaHistorial[]);
    }
    setCargando(false);
  }, [user, pacienteId]);

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [cargarHistorial])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{pacienteNombre}</Text>
        <Text style={styles.subtitle}>Historial de consultas</Text>

        {cargando ? (
          <Text style={styles.vacio}>Cargando...</Text>
        ) : consultas.length === 0 ? (
          <Text style={styles.vacio}>Aún no hay consultas registradas para este paciente.</Text>
        ) : (
          <FlatList
            data={consultas}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardFecha}>{item.fecha} · {item.hora}</Text>

                <Text style={styles.cardLabel}>Síntomas</Text>
                <Text style={styles.cardTexto}>{item.sintomas}</Text>

                <Text style={styles.cardLabel}>Diagnóstico</Text>
                <Text style={styles.cardTexto}>{item.diagnostico}</Text>

                <Text style={styles.cardLabel}>Medicamento</Text>
                <Text style={styles.cardTexto}>{item.medicamento}</Text>

                {item.notas && (
                  <>
                    <Text style={styles.cardLabel}>Notas</Text>
                    <Text style={styles.cardTexto}>{item.notas}</Text>
                  </>
                )}
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
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 2, marginBottom: 16 },
  vacio: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardFecha: { fontSize: 13, color: '#6B7280', marginBottom: 10, fontWeight: '600' },
  cardLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  cardTexto: { fontSize: 14, color: '#374151' },
});