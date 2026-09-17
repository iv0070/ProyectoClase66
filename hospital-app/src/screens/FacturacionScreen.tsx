import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

const EDAD_TERCERA_EDAD = 60;
const DESCUENTO_TERCERA_EDAD = 20;

const costosPorEspecialidad: Record<string, number> = {
  odontologia: 450,
  pediatria: 400,
  ortopedia: 500,
  cirugia: 800,
  medicina_general: 350,
  psicologia: 450,
  fisioterapia: 400,
};

function calcularEdad(fechaNacimiento: string): number {
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}

function EstadoBadge({ label, activo }: { label: string; activo: boolean }) {
  return (
    <View style={[styles.badge, activo ? styles.badgeVerde : styles.badgeGris]}>
      <Text style={[styles.badgeTexto, activo ? styles.badgeTextoVerde : styles.badgeTextoGris]}>
        {label}
      </Text>
    </View>
  );
}

interface CitaConDoctor {
  id: string;
  especialidad: string;
}

export default function FacturacionScreen() {
  const [citaActual, setCitaActual] = useState<CitaConDoctor | null>(null);
  const [edadPaciente, setEdadPaciente] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargarFacturacion = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCargando(false);
      return;
    }

    // 1. Traer la fecha de nacimiento del paciente para calcular su edad
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('fecha_nacimiento')
      .eq('id', user.id)
      .single();

    if (perfil?.fecha_nacimiento) {
      setEdadPaciente(calcularEdad(perfil.fecha_nacimiento));
    }

    // 2. Traer la cita más reciente, con la especialidad del doctor
    const { data, error } = await supabase
      .from('citas')
      .select(`
        id,
        doctor:perfiles!citas_doctor_id_fkey ( especialidad )
      `)
      .eq('paciente_id', user.id)
      .order('fecha', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setCitaActual({
        id: data.id,
        especialidad: (data.doctor as any)?.especialidad ?? '',
      });
    } else {
      setCitaActual(null);
    }

    setCargando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarFacturacion();
    }, [cargarFacturacion])
  );

  const costoBase = citaActual ? costosPorEspecialidad[citaActual.especialidad] ?? 0 : 0;
  const aplicaDescuento = (edadPaciente ?? 0) >= EDAD_TERCERA_EDAD;
  const costoFinal = aplicaDescuento
    ? costoBase * (1 - DESCUENTO_TERCERA_EDAD / 100)
    : costoBase;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Facturación</Text>

        {cargando ? (
          <Text style={styles.vacio}>Cargando...</Text>
        ) : !citaActual ? (
          <Text style={styles.vacio}>No hay ninguna consulta para facturar todavía.</Text>
        ) : (
          <View style={styles.card}>
            <View style={styles.filaEntre}>
              <Text style={styles.especialidad}>{citaActual.especialidad.replace('_', ' ')}</Text>
              <EstadoBadge label={aplicaDescuento ? 'Descuento aplicado' : 'Sin descuento'} activo={aplicaDescuento} />
            </View>
            <View style={styles.linea} />
            <View style={styles.filaEntre}>
              <Text style={styles.label}>Costo de consulta</Text>
              <Text style={styles.valor}>L. {costoBase.toFixed(2)}</Text>
            </View>
            {aplicaDescuento && (
              <View style={styles.filaEntre}>
                <Text style={styles.labelDescuento}>Descuento tercera edad ({DESCUENTO_TERCERA_EDAD}%)</Text>
                <Text style={styles.valorDescuento}>- L. {(costoBase - costoFinal).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.linea} />
            <View style={styles.filaEntre}>
              <Text style={styles.labelTotal}>Total a pagar</Text>
              <Text style={styles.valorTotal}>L. {costoFinal.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 20 },
  vacio: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#E5E7EB' },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  especialidad: { fontSize: 16, fontWeight: '700', color: '#111827', textTransform: 'capitalize' },
  linea: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 10 },
  label: { fontSize: 14, color: '#374151' },
  valor: { fontSize: 14, color: '#111827', fontWeight: '600' },
  labelDescuento: { fontSize: 13, color: '#16A34A' },
  valorDescuento: { fontSize: 13, color: '#16A34A', fontWeight: '600' },
  labelTotal: { fontSize: 16, fontWeight: '700', color: '#111827' },
  valorTotal: { fontSize: 20, fontWeight: '800', color: '#2563EB' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeVerde: { backgroundColor: '#DCFCE7' },
  badgeGris: { backgroundColor: '#F3F4F6' },
  badgeTexto: { fontSize: 11, fontWeight: '600' },
  badgeTextoVerde: { color: '#16A34A' },
  badgeTextoGris: { color: '#6B7280' },
});