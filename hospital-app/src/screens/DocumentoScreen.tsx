import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import CustomButton from '../components/CustomButtom';

type TipoPersona = 'nino' | 'adulto';
type Motivo = 'trabajo' | 'escuela' | 'universidad';

interface DocumentoScreenProps {
  navigation?: any;
  route?: {
    params?: {
      fecha: string;
      hora: string;
      sintomas: string;
      diagnostico: string;
      medicamento: string;
    };
  };
}

export default function DocumentoScreen({ navigation, route }: DocumentoScreenProps) {
  const datos = route?.params ?? {
    fecha: '27/08/2026',
    hora: '09:00 AM',
    sintomas: 'Dolor de cabeza',
    diagnostico: 'Migraña leve',
    medicamento: 'Ibuprofeno 400mg',
  };

  const [tipoPersona, setTipoPersona] = useState<TipoPersona>('adulto');
  const [motivo, setMotivo] = useState<Motivo>('trabajo');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Documentos generados</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nota médica</Text>
          <Text style={styles.line}>Fecha: {datos.fecha}</Text>
          <Text style={styles.line}>Hora: {datos.hora}</Text>
          <Text style={styles.line}>Síntomas: {datos.sintomas}</Text>
          <Text style={styles.line}>Diagnóstico: {datos.diagnostico}</Text>
          <Text style={styles.line}>Medicamento: {datos.medicamento}</Text>
        </View>

        <Text style={styles.sectionLabel}>Tipo de constancia</Text>
        <View style={styles.optionsRow}>
          <CustomButton
            title="Niño"
            onPress={() => setTipoPersona('nino')}
            variant={tipoPersona === 'nino' ? 'primary' : 'secondary'}
            style={styles.optionButton}
          />
          <CustomButton
            title="Adulto"
            onPress={() => setTipoPersona('adulto')}
            variant={tipoPersona === 'adulto' ? 'primary' : 'secondary'}
            style={styles.optionButton}
          />
        </View>

        <Text style={styles.sectionLabel}>Motivo</Text>
        <View style={styles.optionsRow}>
          <CustomButton
            title="Trabajo"
            onPress={() => setMotivo('trabajo')}
            variant={motivo === 'trabajo' ? 'primary' : 'secondary'}
            style={styles.optionButton}
          />
          <CustomButton
            title="Escuela"
            onPress={() => setMotivo('escuela')}
            variant={motivo === 'escuela' ? 'primary' : 'secondary'}
            style={styles.optionButton}
          />
          <CustomButton
            title="Universidad"
            onPress={() => setMotivo('universidad')}
            variant={motivo === 'universidad' ? 'primary' : 'secondary'}
            style={styles.optionButton}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Constancia</Text>
          <Text style={styles.line}>
            Se constata que el paciente ({tipoPersona === 'nino' ? 'menor de edad' : 'adulto'}) fue
            atendido en consulta médica el día {datos.fecha}, por lo cual se recomienda reposo
            justificado para efectos de {motivo}.
          </Text>
        </View>

        <CustomButton
          title="Volver al inicio"
          onPress={() => navigation?.navigate('DoctorHome')}
          variant="secondary"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  line: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
  },
});