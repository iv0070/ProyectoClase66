import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useTheme} from '../context/ThemeContext';

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
  const { colores } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colores.fondoCard, borderColor: colores.borde }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardFecha, { color: colores.textoSecundario }]}>{consulta.fecha} · {consulta.hora}</Text>
        <Text style={styles.cardEspecialidad}>{consulta.doctor_especialidad?.replace('_', ' ')}</Text>
      </View>
      <Text style={[styles.cardDoctor, { color: colores.texto }]}>{consulta.doctor_nombre}</Text>
      <Text style={[styles.cardLabel, { color: colores.textoSecundario }]}>Diagnostico</Text>
      <Text style={[styles.cardTexto, { color: colores.textoSecundario }]}>{consulta.diagnostico}</Text>
      <Text style={[styles.cardLabel, { color: colores.textoSecundario }]}>Medicamento</Text>
      <Text style={[styles.cardTexto, { color: colores.textoSecundario }]}>{consulta.medicamento}</Text>
    </View>
  );
}

export default function ConsultasScreen() {
  const { colores } = useTheme();
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colores.fondo }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colores.texto }]}>Mis consultas</Text>
        <Text style={[styles.subtitle, { color: colores.textoSecundario }]}>Historial de {nombrePaciente}</Text>

        {cargando ? (
          <Text style={[styles.vacio, { color: colores.textoSecundario }]}>Cargando...</Text>
        ) : misConsultas.length === 0 ? (
          <Text style={[styles.vacio, { color: colores.textoSecundario }]}>Aún no tienes consultas registradas.</Text>
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
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    padding: 20
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4
  },

  subtitle: {
    fontSize: 15,
    marginBottom: 20
  },

  vacio: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40
  },

  card: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },

  cardFecha: {
    fontSize: 13,
  },

  cardEspecialidad: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    textTransform: 'capitalize'
  },

  cardDoctor: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10
  },

  cardLabel: {
    fontSize: 12,
    marginTop: 4
  },

  cardTexto: {
    fontSize: 14,
  },
});