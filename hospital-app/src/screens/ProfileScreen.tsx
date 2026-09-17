import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from '../components/CustomButtom';
import { useAuth } from '../context/AuthContext';

interface ProfileScreenProps {
  navigation?: any;
}

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

// Estudios de ejemplo para los doctores. Si luego quieres que cada
// doctor tenga su propia universidad/año, esto se puede mover a mockData.ts
const estudiosDoctor = 'Universidad Nacional Autónoma de Honduras (UNAH)';

function getIniciales(nombre: string) {
  const partes = nombre.trim().split(' ').filter(Boolean);
  const primera = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primera + ultima).toUpperCase();
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>No hay sesión activa</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCerrarSesion = () => {
    logout();
    navigation?.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Mi perfil</Text>

        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTexto}>{getIniciales(user.nombre)}</Text>
          </View>
          <Text style={styles.nombreGrande}>{user.nombre}</Text>
          <View style={styles.rolBadge}>
            <Text style={styles.rolBadgeTexto}>{etiquetaRol[user.rol]}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.fila}>
            <Text style={styles.label}>Usuario</Text>
            <Text style={styles.valor}>{user.usuario}</Text>
          </View>

          {user.rol === 'doctor' && user.especialidad && (
            <>
              <View style={styles.linea} />
              <View style={styles.fila}>
                <Text style={styles.label}>Especialidad</Text>
                <Text style={styles.valor}>
                  {nombresEspecialidad[user.especialidad] ?? user.especialidad}
                </Text>
              </View>
              <View style={styles.linea} />
              <View style={styles.fila}>
                <Text style={styles.label}>Estudios</Text>
                <Text style={[styles.valor, styles.valorMultilinea]}>{estudiosDoctor}</Text>
              </View>
            </>
          )}

          {user.rol === 'paciente' && (
            <>
              <View style={styles.linea} />
              <View style={styles.fila}>
                <Text style={styles.label}>Edad</Text>
                <Text style={styles.valor}>{user.edad ?? '-'}</Text>
              </View>
              <View style={styles.linea} />
              <View style={styles.fila}>
                <Text style={styles.label}>Teléfono</Text>
                <Text style={styles.valor}>{user.telefono ?? '-'}</Text>
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
        <CustomButton
          title="Cerrar sesión"
          onPress={handleCerrarSesion}
          variant="danger"
          style={{ marginTop: 10 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },
  headerCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarTexto: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  nombreGrande: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  rolBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  rolBadgeTexto: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '600',
  },
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
  valorMultilinea: { flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  linea: { height: 1, backgroundColor: '#F3F4F6' },
});