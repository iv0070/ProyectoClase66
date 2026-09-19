import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from '../components/CustomButtom';

//los datos que le pueden mandar, dependiendo de quién entro
interface ProfileScreenProps {
  navigation?: any;
  route?: any;
}

export default function ProfileScreen({ navigation, route }: ProfileScreenProps) {
  const rol = route?.params?.rol as 'doctor' | 'paciente' | 'recepcion' | undefined;
  const nombre = route?.params?.nombre ?? 'Desconocido';
  const usuario = route?.params?.usuario ?? '-';
  const especialidad = route?.params?.especialidad as string | undefined;
  const edad = route?.params?.edad as number | undefined;
  const telefono = route?.params?.telefono as string | undefined;

  const nombresEspecialidad: Record<string, string> = {
    odontologia: 'Odontología',
    pediatria: 'Pediatría',
    ortopedia: 'Ortopedia',
    cirugia: 'Cirugía',
    medicina_general: 'Medicina General',
    psicologia: 'Psicología',
    fisioterapia: 'Fisioterapia',
  };

  const etiquetaRol: Record<string, string> = {
    doctor: 'Doctor',
    paciente: 'Paciente',
    recepcion: 'Recepción',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Mi perfil</Text>

        <View style={styles.card}>
          <View style={styles.fila}>
            <Text style={styles.label}>Rol</Text>
            <Text style={styles.valor}>{rol ? etiquetaRol[rol] : '-'}</Text>
          </View>
          <View style={styles.linea} />

          <View style={styles.fila}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.valor}>{nombre}</Text>
          </View>
          <View style={styles.linea} />

          <View style={styles.fila}>
            <Text style={styles.label}>Usuario</Text>
            <Text style={styles.valor}>{usuario}</Text>
          </View>

          {rol === 'doctor' && especialidad && (
            <>
              <View style={styles.linea} />
              <View style={styles.fila}>
                <Text style={styles.label}>Especialidad</Text>
                <Text style={styles.valor}>{nombresEspecialidad[especialidad] ?? especialidad}</Text>
              </View>
            </>
          )}

          {rol === 'paciente' && (
            <>
              <View style={styles.linea} />
              <View style={styles.fila}>
                <Text style={styles.label}>Edad</Text>
                <Text style={styles.valor}>{edad ?? '-'}</Text>
              </View>
              <View style={styles.linea} />
              <View style={styles.fila}>
                <Text style={styles.label}>Teléfono</Text>
                <Text style={styles.valor}>{telefono ?? '-'}</Text>
              </View>
            </>
          )}
        </View>

        <CustomButton
          title="Volver"
          onPress={() => navigation?.goBack()}
          variant="secondary"
          style={{ marginTop: 16 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  label: { fontSize: 14, color: '#6B7280' },
  valor: { fontSize: 14, color: '#111827', fontWeight: '600' },
  linea: { height: 1, backgroundColor: '#F3F4F6' },
});