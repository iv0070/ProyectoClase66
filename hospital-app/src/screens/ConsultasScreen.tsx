import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

interface ConsultaReal {
  id: string;
  fecha: string;
  hora: string;
  diagnostico: string;
  medicamento: string;
  doctor_id: string;
  doctor_nombre: string;
  doctor_especialidad: string;
}

function ConsultaCard({ consulta }: { consulta: ConsultaReal }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardFecha}>{consulta.fecha} · {consulta.hora}</Text>
        <Text style={styles.cardEspecialidad}>{consulta.doctor_especialidad?.replace('_', ' ')}</Text>
      </View>
      <Text style={styles.cardDoctor}>{consulta.doctor_nombre}</Text>
      <Text style={styles.cardLabel}>Diagnóstico</Text>
      <Text style={styles.cardTexto}>{consulta.diagnostico}</Text>
      <Text style={styles.cardLabel}>Medicamento</Text>
      <Text style={styles.cardTexto}>{consulta.medicamento}</Text>
    </View>
  );
}

export default function ConsultasScreen() {
  const [nombrePaciente, setNombrePaciente] = useState('');
  const [misConsultas, setMisConsultas] = useState<ConsultaReal[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarConsultas = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCargando(false);
      return;
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('nombre')
      .eq('id', user.id)
      .single();
    if (perfil) setNombrePaciente(perfil.nombre);

    const { data, error } = await supabase
      .from('consultas')
      .select(`
        id, fecha, hora, diagnostico, medicamento, doctor_id,
        doctor:perfiles!consultas_doctor_id_fkey ( nombre, especialidad )
      `)
      .eq('paciente_id', user.id)
      .order('fecha', { ascending: false });

    if (!error && data) {
      const formateadas: ConsultaReal[] = data.map((c: any) => ({
        id: c.id,
        fecha: c.fecha,
        hora: c.hora,
        diagnostico: c.diagnostico,
        medicamento: c.medicamento,
        doctor_id: c.doctor_id,
        doctor_nombre: c.doctor?.nombre ?? 'Doctor no encontrado',
        doctor_especialidad: c.doctor?.especialidad ?? '',
      }));
      setMisConsultas(formateadas);
    }
    setCargando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarConsultas();
    }, [cargarConsultas])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Mis consultas</Text>
        <Text style={styles.subtitle}>Historial de {nombrePaciente}</Text>

        {cargando ? (
          <Text style={styles.vacio}>Cargando...</Text>
        ) : misConsultas.length === 0 ? (
          <Text style={styles.vacio}>Aún no tienes consultas registradas.</Text>
        ) : (
          <FlatList
            data={misConsultas}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ConsultaCard consulta={item} />}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 20 },
  vacio: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardFecha: { fontSize: 13, color: '#6B7280' },
  cardEspecialidad: { fontSize: 12, fontWeight: '600', color: '#2563EB', textTransform: 'capitalize' },
  cardDoctor: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 10 },
  cardLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  cardTexto: { fontSize: 14, color: '#374151' },
});