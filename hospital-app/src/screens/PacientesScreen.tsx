import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface PacientesScreenProps {
  navigation?: any;
}

interface PacienteResumen {
  id: string;
  nombre: string;
}

export default function PacientesScreen({ navigation }: PacientesScreenProps) {
  const { colores } = useTheme();
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState<PacienteResumen[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargarPacientes = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('citas')
      .select('paciente_id, paciente:perfiles!paciente_id(id, nombre)')
      .eq('doctor_id', user.id);

    if (!error && data) {
      const mapa = new Map<string, PacienteResumen>();
      (data as any[]).forEach((c) => {
        if (c.paciente) {
          mapa.set(c.paciente.id, { id: c.paciente.id, nombre: c.paciente.nombre });
        }
      });
      const unicos = Array.from(mapa.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
      setPacientes(unicos);
    }
    setCargando(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      cargarPacientes();
    }, [cargarPacientes])
  );

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colores.fondo }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colores.texto }]}>Historial de pacientes</Text>

        <TextInput
          style={[styles.buscador, { backgroundColor: colores.fondoCard, borderColor: colores.borde, color: colores.texto }]}
          placeholder="Buscar paciente..."
          placeholderTextColor={colores.textoSecundario}
          value={busqueda}
          onChangeText={setBusqueda}
          autoCapitalize="none"
        />

        {cargando ? (
          <Text style={[styles.vacio, { color: colores.textoSecundario }]}>Cargando...</Text>
        ) : pacientesFiltrados.length === 0 ? (
          <Text style={[styles.vacio, { color: colores.textoSecundario }]}>
            {pacientes.length === 0 ? 'Aún no has atendido pacientes.' : 'Sin resultados.'}
          </Text>
        ) : (
          <FlatList
            data={pacientesFiltrados}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colores.fondoCard, borderColor: colores.borde }]}
                onPress={() =>
                  navigation?.navigate('HistorialPaciente', {
                    pacienteId: item.id,
                    pacienteNombre: item.nombre,
                  })
                }
              >
                <Text style={[styles.cardNombre, { color: colores.texto }]}>{item.nombre}</Text>
                <Text style={[styles.cardFlecha, { color: colores.textoSecundario }]}>›</Text>
              </TouchableOpacity>
            )}
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16
  },

  buscador: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14
  },

  vacio: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40
  },

  card: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  cardNombre: {
    fontSize: 15,
    fontWeight: '600',
  },

  cardFlecha: {
    fontSize: 20,
  },
});