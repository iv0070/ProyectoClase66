import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface ReceptionHomeScreenProps {
  navigation?: any;
}

interface PacienteReal {
  id: string;
  nombre: string;
  telefono: string | null;
  identidad: string | null;
}

interface CitaReal {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  doctor_nombre: string;
}

interface ConsultaReal {
  id: string;
  fecha: string;
  diagnostico: string;
}

export default function ReceptionHomeScreen({ navigation }: ReceptionHomeScreenProps) {
  const { colores } = useTheme();
  const { user, logout } = useAuth();

  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<PacienteReal[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [pacienteExpandido, setPacienteExpandido] = useState<string | null>(null);
  const [proximaCita, setProximaCita] = useState<CitaReal | null>(null);
  const [historial, setHistorial] = useState<ConsultaReal[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const handleBuscar = async (texto: string) => {
    setBusqueda(texto);

    if (texto.trim() === '') {
      setResultados([]);
      return;
    }

    setBuscando(true);

    const { data, error } = await supabase
      .from('perfiles')
      .select('id, nombre, telefono, identidad')
      .eq('rol', 'paciente')
      .or(`nombre.ilike.%${texto}%,identidad.ilike.%${texto}%`);

    if (!error && data) {
      setResultados(data);
    }
    setBuscando(false);
  };

  const cargarDetallePaciente = async (pacienteId: string) => {
    setCargandoDetalle(true);

    const { data: citaData } = await supabase
      .from('citas')
      .select(`
        id, fecha, hora, estado,
        doctor:perfiles!citas_doctor_id_fkey ( nombre )
      `)
      .eq('paciente_id', pacienteId)
      .in('estado', ['pendiente', 'confirmada'])
      .order('fecha', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (citaData) {
      setProximaCita({
        id: citaData.id,
        fecha: citaData.fecha,
        hora: citaData.hora,
        estado: citaData.estado,
        doctor_nombre: (citaData.doctor as any)?.nombre ?? 'Doctor desconocido',
      });
    } else {
      setProximaCita(null);
    }

    const { data: consultasData } = await supabase
      .from('consultas')
      .select('id, fecha, diagnostico')
      .eq('paciente_id', pacienteId)
      .order('fecha', { ascending: false });

    setHistorial(consultasData ?? []);
    setCargandoDetalle(false);
  };

  const handleToggleExpandir = (pacienteId: string) => {
    if (pacienteExpandido === pacienteId) {
      setPacienteExpandido(null);
      return;
    }
    setPacienteExpandido(pacienteId);
    cargarDetallePaciente(pacienteId);
  };

  const handleSeleccionarPaciente = (paciente: PacienteReal) => {
    navigation?.navigate('AgendarCita', {
      pacienteId: paciente.id,
      pacienteNombre: paciente.nombre,
    });
  };

  const handleCerrarSesion = async () => {
    await logout();
    navigation?.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const renderPaciente = ({ item }: { item: PacienteReal }) => {
    const expandido = pacienteExpandido === item.id;

    return (
      <View style={[styles.card, { backgroundColor: colores.fondoCard, borderColor: colores.borde }]}>
        <TouchableOpacity onPress={() => handleToggleExpandir(item.id)}>
          <Text style={[styles.nombre, { color: colores.texto }]}>{item.nombre}</Text>
          <Text style={[styles.detalle, { color: colores.textoSecundario }]}>
            Tel: {item.telefono ?? 'N/D'} · ID: {item.identidad ?? 'N/D'}
          </Text>
          <Text style={styles.accion}>
            {expandido ? 'Toca para ocultar detalle' : 'Toca para ver detalle'}
          </Text>
        </TouchableOpacity>

        {expandido && (
          <View style={[styles.detalleBox, { borderTopColor: colores.borde }]}>
            {cargandoDetalle ? (
              <Text style={[styles.detalleVacio, { color: colores.textoSecundario }]}>Cargando...</Text>
            ) : (
              <>
                <Text style={[styles.detalleTitulo, { color: colores.textoSecundario }]}>Próxima cita</Text>
                {proximaCita ? (
                  <Text style={[styles.detalleTexto, { color: colores.texto }]}>
                    {proximaCita.fecha} · {proximaCita.hora} con {proximaCita.doctor_nombre} ({proximaCita.estado})
                  </Text>
                ) : (
                  <Text style={[styles.detalleVacio, { color: colores.textoSecundario }]}>No tiene ninguna cita pendiente</Text>
                )}

                <Text style={[styles.detalleTitulo, { color: colores.textoSecundario }]}>Historial de consultas</Text>
                {historial.length === 0 ? (
                  <Text style={[styles.detalleVacio, { color: colores.textoSecundario }]}>Aún no tiene consultas registradas</Text>
                ) : (
                  historial.map((c) => (
                    <Text key={c.id} style={[styles.detalleTexto, { color: colores.texto }]}>
                      {c.fecha} · {c.diagnostico}
                    </Text>
                  ))
                )}
              </>
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colores.fondo }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colores.texto }]}>Recepción</Text>
        <Text style={[styles.subtitle, { color: colores.textoSecundario }]}>Buscar paciente por nombre o identidad</Text>

        <CustomInput
          label="Nombre o número de identidad"
          value={busqueda}
          onChangeText={handleBuscar}
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
            <Text style={[styles.emptyText, { color: colores.textoSecundario }]}>
              {busqueda.trim() === ''
                ? 'Escribe un nombre o identidad para buscar'
                : buscando
                ? 'Buscando...'
                : 'No se encontró ningún paciente con esos datos'}
            </Text>
          }
        />
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
  },

  subtitle: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16
  },

  list: {
    paddingBottom: 20
  },

  card: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },

  nombre: {
    fontSize: 16,
    fontWeight: '600',
  },

  detalle: {
    fontSize: 13,
    marginTop: 4
  },

  accion: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 6,
    fontWeight: '600'
  },

  detalleBox: {
    marginTop: 12,
    borderTopWidth: 1,
    paddingTop: 10
  },

  detalleTitulo: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4
  },

  detalleTexto: {
    fontSize: 13,
    marginBottom: 2
  },

  detalleVacio: {
    fontSize: 13,
    fontStyle: 'italic'
  },

  agendarButton: {
    marginTop: 12
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 30
  },
});