import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
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

const nombresMotivo: Record<Motivo, string> = {
  trabajo: 'trabajo',
  escuela: 'escuela',
  universidad: 'universidad',
};

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
  const [generando, setGenerando] = useState(false);

  const compartirPdf = async (html: string) => {
    try {
      setGenerando(true);
      const { uri } = await Print.printToFileAsync({ html });

      const disponible = await Sharing.isAvailableAsync();
      if (disponible) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      } else {
        Alert.alert('PDF generado', `El archivo se guardó en: ${uri}`);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF. Intenta de nuevo.');
    } finally {
      setGenerando(false);
    }
  };

  const generarNotaMedica = () => {
    const html = `
      <html>
        <body style="font-family: Helvetica; padding: 24px; color: #111827;">
          <h1 style="font-size: 20px;">Nota Médica</h1>
          <hr />
          <p><strong>Fecha:</strong> ${datos.fecha}</p>
          <p><strong>Hora:</strong> ${datos.hora}</p>
          <p><strong>Síntomas:</strong> ${datos.sintomas}</p>
          <p><strong>Diagnóstico:</strong> ${datos.diagnostico}</p>
          <p><strong>Medicamento recetado:</strong> ${datos.medicamento}</p>
          <br />
          <p style="font-size: 12px; color: #6B7280;">
            Documento generado por Sistema Hospitalario Móvil. Sin firma digital certificada.
          </p>
        </body>
      </html>
    `;
    compartirPdf(html);
  };

  const generarConstancia = () => {
    const html = `
      <html>
        <body style="font-family: Helvetica; padding: 24px; color: #111827;">
          <h1 style="font-size: 20px;">Constancia Médica</h1>
          <hr />
          <p>
            Se constata que el paciente
            (${tipoPersona === 'nino' ? 'menor de edad' : 'adulto'})
            fue atendido en consulta médica el día ${datos.fecha},
            por lo cual se recomienda reposo justificado para efectos de
            ${nombresMotivo[motivo]}.
          </p>
          <br /><br />
          <p style="font-size: 12px; color: #6B7280;">
            Documento generado por Sistema Hospitalario Móvil. Sin firma digital certificada.
          </p>
        </body>
      </html>
    `;
    compartirPdf(html);
  };

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

          <CustomButton
            title={generando ? 'Generando...' : 'Generar PDF de nota médica'}
            onPress={generarNotaMedica}
            variant="primary"
            style={styles.pdfButton}
          />
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

          <CustomButton
            title={generando ? 'Generando...' : 'Generar PDF de constancia'}
            onPress={generarConstancia}
            variant="primary"
            style={styles.pdfButton}
          />
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
  pdfButton: {
    marginTop: 12,
  },
});