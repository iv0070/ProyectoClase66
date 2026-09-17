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

interface ReceptionHomeScreenProps {
  navigation?: any;
}

export default function ReceptionHomeScreen({ navigation }: ReceptionHomeScreenProps) {
  // sacamos el logout del contexto, para cerrar sesion de verdad
  const { logout } = useAuth();

  const [busqueda, setBusqueda] = useState('');
  const [pacientes] = useState<Paciente[]>(pacientesIniciales);
  const [pacienteExpandido, setPacienteExpandido] = useState<string | null>(null);

  // filtra la lista de pacientes buscando por nombre o por numero de identidad
  const resultados = pacientes.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.identidad.includes(busqueda)
  );

  // cuando recepcion toca un paciente de la lista, lo manda a agendar cita
  // ya pasandole el id y nombre de ese paciente
  const handleSeleccionarPaciente = (paciente: Paciente) => {
    navigation?.navigate('AgendarCita', {
      pacienteId: paciente.id,
      pacienteNombre: paciente.nombre,
    });
  };

  // abre o cierra el detalle de un paciente (como un acordeon)
  const handleToggleExpandir = (pacienteId: string) => {
    setPacienteExpandido((actual) => (actual === pacienteId ? null : pacienteId));
  };

  // busca el nombre del doctor a partir de su id, para mostrarlo en el detalle
  const getNombreDoctor = (doctorId: string) => {
    const doc = doctores.find((d) => d.id === doctorId);
    return doc ? doc.nombre : 'Doctor desconocido';
  };

  // cierra sesion de verdad (limpia el contexto) y regresa al login
  const handleCerrarSesion = () => {
    logout();
    navigation?.navigate('Login');
  };

  // dibuja cada tarjeta de paciente en la lista
  const renderPaciente = ({ item }: { item: Paciente }) => {
    const expandido = pacienteExpandido === item.id;

    // busca si el paciente tiene una cita pendiente o confirmada
    const proximaCita = citas.find(
      (c) => c.pacienteId === item.id && (c.estado === 'pendiente' || c.estado === 'confirmada')
    );

    // saca todo el historial de consultas de ese paciente
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

        {/* esto solo se muestra si el paciente esta expandido */}
        {expandido && (
          <View style={styles.detalleBox}>
            <Text style={styles.detalleTitulo}>Proxima cita</Text>
            {proximaCita ? (
              <Text style={styles.detalleTexto}>
                {proximaCita.fecha} · {proximaCita.hora} con {getNombreDoctor(proximaCita.doctorId)} ({proximaCita.estado})
              </Text>
            ) : (
              <Text style={styles.detalleVacio}>No tiene ninguna cita pendiente</Text>
            )}

            <Text style={styles.detalleTitulo}>Historial de consultas</Text>
            {historial.length === 0 ? (
              <Text style={styles.detalleVacio}>Aun no tiene consultas registradas</Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Recepcion</Text>
        <Text style={styles.subtitle}>Buscar paciente por nombre o identidad</Text>

        <CustomInput
          label="Nombre o numero de identidad"
          value={busqueda}
          onChangeText={setBusqueda}
          validationType="text"
          required={false}
          placeholder="Escribe nombre o identidad..."
        />

        {/* lista de pacientes que coinciden con la busqueda */}
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id}
          renderItem={renderPaciente}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {busqueda.trim() === ''
                ? 'Escribe un nombre o identidad para buscar'
                : 'No se encontro ningun paciente con esos datos'}
            </Text>
          }
        />

        <CustomButton
          title="Crear paciente nuevo"
          onPress={() => navigation?.navigate('NuevoPaciente')}
          variant="primary"
        />

        {/* ya no manda parametros, el perfil saca todo del AuthContext */}
        <CustomButton
          title="Ver perfil"
          onPress={() => navigation?.navigate('Perfil')}
          variant="secondary"
          style={{ marginTop: 10 }}
        />
        <CustomButton
          title="Cerrar sesion"
          onPress={handleCerrarSesion}
          variant="danger"
          style={{ marginTop: 10 }}
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
});