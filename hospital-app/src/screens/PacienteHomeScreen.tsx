import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomButton from '../components/CustomButtom';
import { supabase } from '../../lib/supabase';

interface PacienteHomeScreenProps {
  navigation?: any;
}

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Hola, {nombre}</Text>
        <Text style={styles.subtitle}>¿Qué deseas hacer hoy?</Text>

        <CustomButton
          title="Agendar cita"
          onPress={() => navigation?.navigate('AgendarCita')}
          variant="primary"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24, textAlign: 'center' },
  button: { marginTop: 8 },
});