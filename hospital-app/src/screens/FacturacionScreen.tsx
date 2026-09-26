import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
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

interface Recibo {
  id: string;
  fecha: string;
  especialidad: string;
  farmaciaNombre: string | null;
  descuentoFarmacia: number;
}

export default function FacturacionScreen() {
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [edadPaciente, setEdadPaciente] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargarFacturacion = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCargando(false);
      return;
    }

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('fecha_nacimiento')
      .eq('id', user.id)
      .single();

    if (perfil?.fecha_nacimiento) {
      setEdadPaciente(calcularEdad(perfil.fecha_nacimiento));
    }

    const { data, error } = await supabase
      .from('consultas')
      .select(`
        id,
        fecha,
        cita:citas!cita_id ( doctor:perfiles!doctor_id ( especialidad ) ),
        farmacia:farmacias ( nombre, descuento )
      `)
      .eq('paciente_id', user.id)
      .order('fecha', { ascending: false });

    if (!error && data) {
      const formateados: Recibo[] = (data as any[]).map((c) => ({
        id: c.id,
        fecha: c.fecha,
        especialidad: c.cita?.doctor?.especialidad ?? '',
        farmaciaNombre: c.farmacia?.nombre ?? null,
        descuentoFarmacia: c.farmacia?.descuento ?? 0,
      }));
      setRecibos(formateados);
    }

    setCargando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarFacturacion();
    }, [cargarFacturacion])
  );

  const aplicaDescuentoEdad = (edadPaciente ?? 0) >= EDAD_TERCERA_EDAD;

  const calcularRecibo = (recibo: Recibo) => {
    const costoBase = costosPorEspecialidad[recibo.especialidad] ?? 0;
    const descuentoEdadPct = aplicaDescuentoEdad ? DESCUENTO_TERCERA_EDAD : 0;
    const descuentoFarmaciaPct = recibo.farmaciaNombre ? recibo.descuentoFarmacia : 0;
    const descuentoTotalPct = descuentoEdadPct + descuentoFarmaciaPct;
    const montoDescuento = costoBase * (descuentoTotalPct / 100);
    const total = costoBase - montoDescuento;
    return { costoBase, descuentoEdadPct, descuentoFarmaciaPct, montoDescuento, total };
  };

  const totalGeneral = recibos.reduce((suma, r) => suma + calcularRecibo(r).total, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Facturación</Text>

        {cargando ? (
          <Text style={styles.vacio}>Cargando...</Text>
        ) : recibos.length === 0 ? (
          <Text style={styles.vacio}>No hay ninguna consulta para facturar todavía.</Text>
        ) : (
          <>
            <FlatList
              data={recibos}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                const { costoBase, descuentoEdadPct, descuentoFarmaciaPct, montoDescuento, total } = calcularRecibo(item);
                const tieneDescuento = descuentoEdadPct > 0 || descuentoFarmaciaPct > 0;

                return (
                  <View style={styles.card}>
                    <View style={styles.filaEntre}>
                      <Text style={styles.especialidad}>{item.especialidad.replace('_', ' ')}</Text>
                      <EstadoBadge label={tieneDescuento ? 'Con descuento' : 'Sin descuento'} activo={tieneDescuento} />
                    </View>
                    <Text style={styles.fecha}>{item.fecha}</Text>
                    <View style={styles.linea} />

                    <View style={styles.filaEntre}>
                      <Text style={styles.label}>Costo de consulta</Text>
                      <Text style={styles.valor}>L. {costoBase.toFixed(2)}</Text>
                    </View>

                    {descuentoEdadPct > 0 && (
                      <View style={styles.filaEntre}>
                        <Text style={styles.labelDescuento}>Descuento tercera edad ({descuentoEdadPct}%)</Text>
                        <Text style={styles.valorDescuento}>
                          - L. {(costoBase * descuentoEdadPct / 100).toFixed(2)}
                        </Text>
                      </View>
                    )}

                    {descuentoFarmaciaPct > 0 && (
                      <View style={styles.filaEntre}>
                        <Text style={styles.labelDescuento}>
                          Descuento {item.farmaciaNombre} ({descuentoFarmaciaPct}%)
                        </Text>
                        <Text style={styles.valorDescuento}>
                          - L. {(costoBase * descuentoFarmaciaPct / 100).toFixed(2)}
                        </Text>
                      </View>
                    )}

                    <View style={styles.linea} />
                    <View style={styles.filaEntre}>
                      <Text style={styles.labelTotal}>Total</Text>
                      <Text style={styles.valorTotal}>L. {total.toFixed(2)}</Text>
                    </View>
                  </View>
                );
              }}
            />

            <View style={styles.totalGeneralBox}>
              <Text style={styles.totalGeneralLabel}>Total acumulado</Text>
              <Text style={styles.totalGeneralValor}>L. {totalGeneral.toFixed(2)}</Text>
            </View>
          </>
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12 },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
  especialidad: { fontSize: 16, fontWeight: '700', color: '#111827', textTransform: 'capitalize' },
  fecha: { fontSize: 12, color: '#9CA3AF' },
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
  totalGeneralBox: { backgroundColor: '#111827', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalGeneralLabel: { fontSize: 14, color: '#D1D5DB', fontWeight: '600' },
  totalGeneralValor: { fontSize: 22, fontWeight: '800', color: '#fff' },
});