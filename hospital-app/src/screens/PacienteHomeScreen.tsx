<<<<<<< HEAD
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomButton from '../components/CustomButtom';
import { supabase } from '../../lib/supabase';
=======
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import {
  pacientes as pacientesIniciales,
  citas,
  consultas,
  doctores,
} from '../data/mockData';
import { Paciente } from '../types';
import { useAuth } from '../context/AuthContext';
>>>>>>> origin/persona1-ashllycruz

interface ReceptionHomeScreenProps {
  navigation?: any;
}

<<<<<<< HEAD
export default function PacienteHomeScreen({ navigation }: PacienteHomeScreenProps) {
  const [nombre, setNombre] = useState('...');

  const cargarNombre = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('perfiles')
      .select('nombre')
      .eq('id', user.id)
      .single();

    if (data) setNombre(data.nombre);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarNombre();
    }, [cargarNombre])
  );
=======
export default function ReceptionHomeScreen({ navigation }: ReceptionHomeScreenProps) {
  const { logout } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [pacientes] = useState<Paciente[]>(pacientesIniciales);
  const [pacienteExpandido, setPacienteExpandido] = useState<string | null>(null);

  // ahora busca tanto por nombre como por número de identidad
  const resultados = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.identidad.includes(busqueda)
  );

  const handleSeleccionarPaciente = (paciente: Paciente) => {
    navigation?.navigate('AgendarCita', {
      pacienteId: paciente.id,
      pacienteNombre: paciente.nombre,
    });
  };

  const handleToggleExpandir = (pacienteId: string) => {
    setPacienteExpandido((actual) => (actual === pacienteId ? null : pacienteId));
  };

  const getNombreDoctor = (doctorId: string) => {
    const doc = doctores.find((d) => d.id === doctorId);
    return doc ? doc.nombre : 'Doctor desconocido';
  };

  const handleCerrarSesion = () => {
    logout();
    navigation?.navigate('Login');
  };

  const renderPaciente = ({ item }: { item: Paciente }) => {
    const expandido = pacienteExpandido === item.id;

    const proximaCita = citas.find(
      (c) => c.pacienteId === item.id && (c.estado === 'pendiente' || c.estado === 'confirmada')
    );

    const historial = consultas.filter((c) => c.pacienteId === item.id);

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => handleToggleExpandir(item.id)}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.detalle}>Edad: {item.edad} · Tel: {item.telefono}</Text>
          <Text style={styles.accion}>
            {expandido ? 'Toca para ocultar detalle' : 'Toca para ver detalle'}
          </Text>
        </TouchableOpacity>

        {expandido && (
          <View style={styles.detalleBox}>
            <Text style={styles.detalleTitulo}>Próxima cita</Text>
            {proximaCita ? (
              <Text style={styles.detalleTexto}>
                {proximaCita.fecha} · {proximaCita.hora} con {getNombreDoctor(proximaCita.doctorId)} ({proximaCita.estado})
              </Text>
            ) : (
              <Text style={styles.detalleVacio}>No tiene ninguna cita pendiente</Text>
            )}

            <Text style={styles.detalleTitulo}>Historial de consultas</Text>
            {historial.length === 0 ? (
              <Text style={styles.detalleVacio}>Aún no tiene consultas registradas</Text>
            ) : (
              historial.map((c) => (
                <Text key={c.id} style={styles.detalleTexto}>
                  {c.fecha} · {c.diagnostico}
                </Text>
              ))
            )}

            <CustomButton
              title="Agendar cita"
              onPress={() => handleSeleccionarPaciente(item)}
              variant="primary"
              style={styles.agendarButton}
            />
          </View>
        )}
      </View>
    );
  };
>>>>>>> origin/persona1-ashllycruz

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
<<<<<<< HEAD
        <Text style={styles.title}>Hola, {nombre}</Text>
        <Text style={styles.subtitle}>¿Qué deseas hacer hoy?</Text>
=======
        <Text style={styles.title}>Recepción</Text>
        <Text style={styles.subtitle}>Buscar paciente por nombre o identidad</Text>

        <CustomInput
          label="Nombre o número de identidad"
          value={busqueda}
          onChangeText={setBusqueda}
          validationType="text"
          required={false}
          placeholder="Escribe nombre o identidad..."
        />

        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          renderItem={renderPaciente}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {busqueda.trim() === ''
                ? 'Escribe un nombre o identidad para buscar'
                : 'No se encontró ningún paciente con esos datos'}
            </Text>
          }
        />
>>>>>>> origin/persona1-ashllycruz

        <CustomButton
          title="Crear paciente nuevo"
          onPress={() => navigation?.navigate('NuevoPaciente')}
          variant="primary"
        />
<<<<<<< HEAD
=======
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
>>>>>>> origin/persona1-ashllycruz
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24, textAlign: 'center' },
  button: { marginTop: 8 },
=======
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
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  detalle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  accion: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 6,
    fontWeight: '600',
  },
  detalleBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  detalleTitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginTop: 8,
    marginBottom: 4,
  },
  detalleTexto: {
    fontSize: 13,
    color: '#111827',
    marginBottom: 2,
  },
  detalleVacio: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  agendarButton: {
    marginTop: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 30,
  },
>>>>>>> origin/persona1-ashllycruz
});