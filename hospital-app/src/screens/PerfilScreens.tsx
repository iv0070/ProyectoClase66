import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButtom';
import { supabase } from '../../lib/supabase';

interface Perfil {
  nombre: string;
  telefono: string | null;
  edad: number | null;
  identidad: string | null;
}

export default function PerfilScreen({ navigation }: { navigation?: any }) {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCargando(false);
      return;
    }

    const { data, error } = await supabase
      .from('perfiles')
      .select('nombre, telefono, edad, identidad')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setPerfil(data);
    }
    setCargando(false);
  };

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut();
    navigation?.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.cargando}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Mi perfil</Text>

        {perfil ? (
          <View style={styles.card}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.valor}>{perfil.nombre}</Text>

            <Text style={styles.label}>Edad</Text>
            <Text style={styles.valor}>{perfil.edad ?? 'No especificada'}</Text>

            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.valor}>{perfil.telefono ?? 'No especificado'}</Text>

            <Text style={styles.label}>Identidad</Text>
            <Text style={styles.valor}>{perfil.identidad ?? 'No especificada'}</Text>
          </View>
        ) : (
          <Text style={styles.cargando}>No se encontró tu perfil.</Text>
        )}

        <CustomButton
          title="Cerrar sesión"
          onPress={handleCerrarSesion}
          variant="danger"
          style={{ marginTop: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 20 },
  cargando: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#E5E7EB' },
  label: { fontSize: 12, color: '#9CA3AF', marginTop: 12 },
  valor: { fontSize: 16, color: '#111827', fontWeight: '600' },
});