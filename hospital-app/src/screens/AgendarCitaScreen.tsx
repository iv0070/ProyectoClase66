import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface AgendarCitaScreenProps {
  navigation?: any;
  route?: any;
}

const HORARIOS_DISPONIBLES = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

const nombresEspecialidad: Record<string, string> = {
  odontologia: 'Odontología',
  pediatria: 'Pediatría',
  ortopedia: 'Ortopedia',
  cirugia: 'Cirugía',
  medicina_general: 'Medicina General',
  psicologia: 'Psicología',
  fisioterapia: 'Fisioterapia',
};

interface DoctorReal {
  id: string;
  nombre: string;
  especialidad: string;
}

export default function AgendarCitaScreen({ navigation, route }: AgendarCitaScreenProps) {
  const { colores, tema } = useTheme();
  const { user } = useAuth();

  const pacienteIdParam = route?.params?.pacienteId;
  const pacienteNombreParam = route?.params?.pacienteNombre;

  const pacienteId = pacienteIdParam ?? user?.id ?? '';
  const pacienteNombre = pacienteNombreParam ?? user?.nombre ?? 'Paciente';

  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [especialidadElegida, setEspecialidadElegida] = useState<string | null>(null);

  const [doctores, setDoctores] = useState<DoctorReal[]>([]);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState<DoctorReal | null>(null);

  const [citasOcupadas, setCitasOcupadas] = useState<{ fecha: string; hora: string }[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);

  const [motivo, setMotivo] = useState('');
  const [tipoConsulta, setTipoConsulta] = useState<'primera_vez' | 'seguimiento'>('primera_vez');

  const [formError, setFormError] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const cargarDoctores = async () => {
      const { data } = await supabase
        .from('perfiles')
        .select('id, nombre, especialidad')
        .eq('rol', 'doctor');

      if (data) {
        setDoctores(data);
        const especialidadesUnicas = Array.from(new Set(data.map((d) => d.especialidad).filter(Boolean)));
        setEspecialidades(especialidadesUnicas as string[]);
      }
    };
    cargarDoctores();
  }, []);

  const cargarCitasDelDoctor = useCallback(async (doctorId: string) => {
    const { data } = await supabase
      .from('citas')
      .select('fecha, hora')
      .eq('doctor_id', doctorId)
      .in('estado', ['pendiente', 'confirmada']);

    setCitasOcupadas(data ?? []);
  }, []);

  const handleElegirDoctor = (doctor: DoctorReal) => {
    setDoctorSeleccionado(doctor);
    setFechaSeleccionada(null);
    setHoraSeleccionada(null);
    cargarCitasDelDoctor(doctor.id);
  };

  function estaLlenoElDia(fechaStr: string): boolean {
    const ocupadasEseDia = citasOcupadas.filter((c) => c.fecha === fechaStr);
    return ocupadasEseDia.length >= HORARIOS_DISPONIBLES.length;
  }

  function generarFechasMarcadas() {
    const marcado: Record<string, any> = {};
    const hoy = new Date();

    for (let i = 0; i < 30; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const fechaStr = fecha.toISOString().split('T')[0];

      if (estaLlenoElDia(fechaStr)) {
        marcado[fechaStr] = { disabled: true, disableTouchEvent: true, textColor: '#D1D5DB' };
      }
    }

    if (fechaSeleccionada) {
      marcado[fechaSeleccionada] = { ...marcado[fechaSeleccionada], selected: true, selectedColor: '#2563EB' };
    }

    return marcado;
  }

  const horasOcupadasEseDia = citasOcupadas
    .filter((c) => c.fecha === fechaSeleccionada)
    .map((c) => c.hora);
  const horasDisponibles = HORARIOS_DISPONIBLES.filter((h) => !horasOcupadasEseDia.includes(h));

  const handleAgendar = async () => {
    if (!doctorSeleccionado) {
      setFormError('Debes elegir un doctor');
      return;
    }
    if (!fechaSeleccionada || !horaSeleccionada) {
      setFormError('Debes elegir fecha y hora');
      return;
    }
    if (!motivo.trim()) {
      setFormError('Describe brevemente el motivo de tu consulta');
      return;
    }

    setFormError('');
    setCargando(true);

    const { error } = await supabase.from('citas').insert({
      paciente_id: pacienteId,
      doctor_id: doctorSeleccionado.id,
      fecha: fechaSeleccionada,
      hora: horaSeleccionada,
      estado: 'pendiente',
      motivo: motivo.trim(),
      tipo_consulta: tipoConsulta,
    });

    setCargando(false);

    if (error) {
      setFormError('No se pudo agendar la cita: ' + error.message);
      return;
    }

    Alert.alert(
      'Cita agendada',
      `La cita de ${pacienteNombre} con ${doctorSeleccionado.nombre} quedo en estado pendiente, esperando confirmacion.`,
      [{ text: 'OK', onPress: () => navigation?.goBack() }]
    );
  };

  const doctoresFiltrados = especialidadElegida
    ? doctores.filter((d) => d.especialidad === especialidadElegida)
    : [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colores.fondo }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: colores.texto }]}>Agendar cita</Text>
        <Text style={[styles.subtitle, { color: colores.textoSecundario }]}>Para {pacienteNombre}</Text>

        <Text style={[styles.label, { color: colores.textoSecundario }]}>Especialidad</Text>
        <View style={styles.chipsRow}>
          {especialidades.map((esp) => (
            <TouchableOpacity
              key={esp}
              style={[
                styles.chip,
                { backgroundColor: colores.fondoCard, borderColor: colores.borde },
                especialidadElegida === esp && styles.chipActivo,
              ]}
              onPress={() => {
                setEspecialidadElegida(esp);
                setDoctorSeleccionado(null);
                setFechaSeleccionada(null);
              }}
            >
              <Text style={[styles.chipTexto, { color: colores.textoSecundario }, especialidadElegida === esp && styles.chipTextoActivo]}>
                {nombresEspecialidad[esp] ?? esp}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {especialidadElegida && (
          <>
            <Text style={[styles.label, { color: colores.textoSecundario }]}>Doctor</Text>
            {doctoresFiltrados.map((doc) => (
              <CustomButton
                key={doc.id}
                title={doc.nombre}
                onPress={() => handleElegirDoctor(doc)}
                variant={doctorSeleccionado?.id === doc.id ? 'primary' : 'secondary'}
                style={styles.doctorButton}
              />
            ))}
          </>
        )}

        {doctorSeleccionado && (
          <>
            <Text style={[styles.label, { color: colores.textoSecundario }]}>Fecha</Text>
            <Calendar
              minDate={new Date().toISOString().split('T')[0]}
              markedDates={generarFechasMarcadas()}
              onDayPress={(day: { dateString: string }) => {
                if (!estaLlenoElDia(day.dateString)) {
                  setFechaSeleccionada(day.dateString);
                  setHoraSeleccionada(null);
                }
              }}
              theme={{
                todayTextColor: '#2563EB',
                selectedDayBackgroundColor: '#2563EB',
                arrowColor: '#2563EB',
                calendarBackground: colores.fondoCard,
                dayTextColor: colores.texto,
                monthTextColor: colores.texto,
                textDisabledColor: colores.textoSecundario,
              }}
            />
          </>
        )}

        {fechaSeleccionada && (
          <>
            <Text style={[styles.label, { color: colores.textoSecundario }]}>Hora</Text>
            <View style={styles.chipsRow}>
              {horasDisponibles.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[
                    styles.chip,
                    { backgroundColor: colores.fondoCard, borderColor: colores.borde },
                    horaSeleccionada === h && styles.chipActivo,
                  ]}
                  onPress={() => setHoraSeleccionada(h)}
                >
                  <Text style={[styles.chipTexto, { color: colores.textoSecundario }, horaSeleccionada === h && styles.chipTextoActivo]}>{h}</Text>
                </TouchableOpacity>
              ))}
              {horasDisponibles.length === 0 && <Text style={styles.emptyText}>Sin horarios libres ese día</Text>}
            </View>
          </>
        )}

        {horaSeleccionada && (
          <>
            <Text style={[styles.label, { color: colores.textoSecundario }]}>Tipo de consulta</Text>
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  { backgroundColor: colores.fondoCard, borderColor: colores.borde },
                  tipoConsulta === 'primera_vez' && styles.chipActivo,
                ]}
                onPress={() => setTipoConsulta('primera_vez')}
              >
                <Text style={[styles.chipTexto, { color: colores.textoSecundario }, tipoConsulta === 'primera_vez' && styles.chipTextoActivo]}>Primera vez</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.chip,
                  { backgroundColor: colores.fondoCard, borderColor: colores.borde },
                  tipoConsulta === 'seguimiento' && styles.chipActivo,
                ]}
                onPress={() => setTipoConsulta('seguimiento')}
              >
                <Text style={[styles.chipTexto, { color: colores.textoSecundario }, tipoConsulta === 'seguimiento' && styles.chipTextoActivo]}>Seguimiento</Text>
              </TouchableOpacity>
            </View>

            <CustomInput
              label="Motivo de la consulta"
              value={motivo}
              onChangeText={setMotivo}
              validationType="text"
              placeholder="Describe brevemente tu sintoma o motivo"
              multiline
            />
          </>
        )}

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <CustomButton
          title={cargando ? 'Agendando...' : 'Agendar cita'}
          onPress={handleAgendar}
          variant="primary"
          disabled={cargando}
          loading={cargando}
        />
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
    fontSize: 22,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },

  chipActivo: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB'
  },

  chipTexto: {
    fontSize: 13,
  },
  chipTextoActivo: {
    color: '#fff',
    fontWeight: '600'
  },

  doctorButton: {
    marginBottom: 8
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic'
  },

  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center'
  },
});
