import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { supabase } from '../../lib/supabase';


interface CambiarPasswordObligatorioScreenProps {
  navigation?: any;
  route?: any;
}

export default function CambiarPasswordObligatorioScreen({
  navigation,
  route,
}: CambiarPasswordObligatorioScreenProps) {
  const rolDestino = route?.params?.rolDestino; // 'doctor' o 'recepcion'

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleGuardar = async () => {
    if (!nuevaContrasena.trim() || nuevaContrasena.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setError('');
    setCargando(true);

    // 1. Cambiar la contraseña real en Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      password: nuevaContrasena,
    });

    if (authError) {
      setCargando(false);
      setError('No se pudo cambiar la contraseña: ' + authError.message);
      return;
    }

    // 2. Marcar en el perfil que ya no necesita cambiarla
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('perfiles')
        .update({ debe_cambiar_password: false })
        .eq('id', user.id);
    }

    setCargando(false);

    Alert.alert('Contraseña actualizada', 'Ya puedes usar tu nueva contraseña.', [
      {
        text: 'Continuar',
        onPress: () => {
          const destino = rolDestino === 'doctor' ? 'DoctorStack' : 'ReceptionStack';
          navigation?.reset({ index: 0, routes: [{ name: destino }] });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Cambia tu contraseña</Text>
        <Text style={styles.subtitle}>
          Por seguridad, debes crear una nueva contraseña antes de continuar.
        </Text>

        <CustomInput
          label="Nueva contraseña"
          value={nuevaContrasena}
          onChangeText={setNuevaContrasena}
          validationType="password"
          placeholder="••••••••"
        />

        <CustomInput
          label="Confirmar nueva contraseña"
          value={confirmarContrasena}
          onChangeText={setConfirmarContrasena}
          validationType="password"
          placeholder="••••••••"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <CustomButton
          title={cargando ? 'Guardando...' : 'Guardar y continuar'}
          onPress={handleGuardar}
          variant="primary"
          disabled={cargando}
          loading={cargando}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  errorText: { color: '#DC2626', fontSize: 14, marginBottom: 12, textAlign: 'center' },
});