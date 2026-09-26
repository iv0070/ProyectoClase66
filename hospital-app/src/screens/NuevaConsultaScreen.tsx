import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface NuevaConsultaScreenProps {
  navigation?: any;
}

interface CitaConfirmada {
  id: string;
  paciente_id: string;
  fecha: string;
  hora: string;
   motivo: string | null;
  paciente: { nombre: string } | null;
}

export default function NuevaConsultaScreen({ navigation }: NuevaConsultaScreenProps) {
  const { user } = useAuth();

  const [citasConfirmadas, setCitasConfirmadas] = useState<CitaConfirmada[]>([]);
  const [cargandoCitas, setCargandoCitas] = useState(true);

  const [citaSeleccionada, setCitaSeleccionada] = useState<CitaConfirmada | null>(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [medicamento, setMedicamento] = useState('');
   const [notas, setNotas] = useState('');
  const [formError, setFormError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargarCitasConfirmadas = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('citas')
            .select('id, paciente_id, fecha, hora, motivo, paciente:perfiles!paciente_id(nombre)')
      .eq('doctor_id', user.id)
      .eq('estado', 'confirmada')
      .order('fecha', { ascending: true });

    if (!error && data) {
      setCitasConfirmadas(data as unknown as CitaConfirmada[]);
    }
    setCargandoCitas(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      cargarCitasConfirmadas();
    }, [cargarCitasConfirmadas])
  );

  const getNombrePaciente = (cita: CitaConfirmada) => {
    return cita.paciente?.nombre ?? 'Paciente desconocido';
  };

  const handleSeleccionarCita = (cita: CitaConfirmada) => {
    setCitaSeleccionada(cita);
    setFecha(cita.fecha);
    setHora(cita.hora);
    setFormError('');
  };

  const handleGenerar = async () => {
    if (!user) return;

    if (!citaSeleccionada) {
      setFormError('Debes elegir para qué paciente es la consulta');
      return;
    }

    if (
      fecha.trim() === '' ||
      hora.trim() === '' ||
      sintomas.trim() === '' ||
      diagnostico.trim() === '' ||
      medicamento.trim() === ''
    ) {
      setFormError('Todos los campos son obligatorios');
      return;
    }

    setFormError('');
    setCargando(true);

    const { error: consultaError } = await supabase.from('consultas').insert({
      cita_id: citaSeleccionada.id,
      paciente_id: citaSeleccionada.paciente_id,
      doctor_id: user.id,
      fecha,
      hora,
      sintomas,
      diagnostico,
      medicamento,
        notas: notas.trim() || null,
    });

    if (consultaError) {
      setCargando(false);
      setFormError('No se pudo guardar la consulta: ' + consultaError.message);
      return;
    }

    const { error: citaError } = await supabase
      .from('citas')
      .update({ estado: 'completada' })
      .eq('id', citaSeleccionada.id);

    setCargando(false);

    if (citaError) {
      setFormError('La consulta se guardó pero no se pudo actualizar la cita: ' + citaError.message);
      return;
    }

    navigation?.navigate('Documento', {
      pacienteId: citaSeleccionada.paciente_id,
      pacienteNombre: getNombrePaciente(citaSeleccionada),
      citaId: citaSeleccionada.id,
      fecha,
      hora,
      sintomas,
      diagnostico,
      medicamento,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Nueva consulta</Text>
        <Text style={styles.subtitle}>Elige el paciente (cita confirmada)</Text>

        <View style={styles.citasList}>
          {cargandoCitas ? (
            <Text style={styles.emptyText}>Cargando citas...</Text>
          ) : citasConfirmadas.length === 0 ? (
            <Text style={styles.emptyText}>No tienes citas confirmadas por ahora</Text>
          ) : (
            citasConfirmadas.map((item) => {
              const seleccionada = citaSeleccionada?.id === item.id;
              return (
                <CustomButton
                  key={item.id}
                  title={`${getNombrePaciente(item)} · ${item.fecha} ${item.hora}`}
                  onPress={() => handleSeleccionarCita(item)}
                  variant={seleccionada ? 'primary' : 'secondary'}
                  style={styles.citaButton}
                />
              );
            })
          )}
        </View>

               {citaSeleccionada && (
          <>
            {citaSeleccionada.motivo && (
              <View style={styles.motivoBox}>
                <Text style={styles.motivoLabel}>Motivo de la consulta</Text>
                <Text style={styles.motivoTexto}>{citaSeleccionada.motivo}</Text>
              </View>
            )}

            <CustomInput
              label="Fecha (AAAA-MM-DD)"
              value={fecha}
              onChangeText={setFecha}
              validationType="text"
              placeholder="2026-08-27"
            />

            <CustomInput
              label="Hora"
              value={hora}
              onChangeText={setHora}
              validationType="text"
              placeholder="09:00 AM"
            />

            <CustomInput
              label="Síntomas"
              value={sintomas}
              onChangeText={setSintomas}
              validationType="text"
              placeholder="Describe los síntomas"
              multiline
            />

            <CustomInput
              label="Diagnóstico"
              value={diagnostico}
              onChangeText={setDiagnostico}
              validationType="text"
              placeholder="Diagnóstico médico"
              multiline
            />

            <CustomInput
              label="Medicamento"
              value={medicamento}
              onChangeText={setMedicamento}
              validationType="text"
              placeholder="Medicamento recetado"
            />
               

            <CustomInput
              label="Notas / Observaciones"
              value={notas}
              onChangeText={setNotas}
              validationType="text"
              placeholder="Observaciones adicionales sobre la consulta (opcional)"
              multiline
            />

          </>
        )}

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <CustomButton
          title={cargando ? 'Guardando...' : 'Generar documentos'}
          onPress={handleGenerar}
          variant="primary"
          disabled={cargando}
          loading={cargando}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 4, marginBottom: 12 },
  citasList: { marginBottom: 16 },
   citaButton: { marginBottom: 8 },
  motivoBox: { backgroundColor: '#EFF6FF', borderRadius: 8, padding: 12, marginBottom: 16 },
  motivoLabel: { fontSize: 12, color: '#2563EB', fontWeight: '600', marginBottom: 4 },
  motivoTexto: { fontSize: 14, color: '#1E3A8A' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginVertical: 12 },
  errorText: { color: '#DC2626', fontSize: 14, marginBottom: 12, textAlign: 'center' },
});