
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomButton from '../components/CustomButtom';
import { supabase } from '../../lib/supabase';

interface ConsultaReal {
  id: string;
  fecha: string;
  hora: string;
  diagnostico: string;
  medicamento: string;
  farmacia_id: string | null;
}

interface FarmaciaReal {
  id: string;
  nombre: string;
  descuento: number;
}

export default function RecetasScreen() {
  const [consultaSeleccionadaId, setConsultaSeleccionadaId] = useState<string | null>(null);
  const [farmaciaSeleccionada, setFarmaciaSeleccionada] = useState<string | null>(null);
  const [misConsultas, setMisConsultas] = useState<ConsultaReal[]>([]);
  const [farmacias, setFarmacias] = useState<FarmaciaReal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCargando(false);
      return;
    }

    const [{ data: consultasData, error: consultasError }, { data: farmaciasData }] = await Promise.all([
      supabase
        .from('consultas')
        .select('id, fecha, hora, diagnostico, medicamento, farmacia_id')
        .eq('paciente_id', user.id)
        .is('farmacia_id', null)
        .order('fecha', { ascending: false }),
      supabase.from('farmacias').select('id, nombre, descuento'),
    ]);

    if (!consultasError && consultasData) {
      setMisConsultas(consultasData);
    }
    if (farmaciasData) {
      setFarmacias(farmaciasData);
    }
    setCargando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos])
  );

  const farmaciaHospital = farmacias.find((f) => f.nombre === 'Farmacia del Hospital');
  const otrasFarmacias = farmacias.filter((f) => f.nombre !== 'Farmacia del Hospital');

  const handleConfirmarFarmacia = async () => {
    if (!consultaSeleccionadaId || !farmaciaSeleccionada) return;

    const farmacia = farmacias.find((f) => f.id === farmaciaSeleccionada);
    if (!farmacia) return;

        setGuardando(true);
    const { error, data, count } = await supabase
      .from('consultas')
      .update({ farmacia_id: farmaciaSeleccionada })
      .eq('id', consultaSeleccionadaId)
      .select();
    setGuardando(false);

   

    if (error) {
      Alert.alert('Error', 'No se pudo guardar la farmacia: ' + error.message);
      return;
    }

  

    Alert.alert(
      'Receta enviada',
      `Tu receta fue enviada a ${farmacia.nombre}.\nDescuento por referido: ${farmacia.descuento}%.`
    );

    setConsultaSeleccionadaId(null);
    setFarmaciaSeleccionada(null);
    cargarDatos();
  };

  function FarmaciaCard({ farmacia }: { farmacia: FarmaciaReal }) {
    const seleccionada = farmaciaSeleccionada === farmacia.id;
    return (
      <TouchableOpacity
        style={[styles.farmaciaCard, seleccionada && styles.farmaciaCardSeleccionada]}
        onPress={() => setFarmaciaSeleccionada(farmacia.id)}
      >
        <View>
          <Text style={styles.farmaciaNombre}>{farmacia.nombre}</Text>
          <Text style={styles.farmaciaDescuento}>{farmacia.descuento}% de descuento por referido</Text>
        </View>
        <View style={[styles.radio, seleccionada && styles.radioSeleccionado]} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Mis recetas</Text>

        {cargando ? (
          <Text style={styles.vacio}>Cargando...</Text>
        ) : misConsultas.length === 0 ? (
          <Text style={styles.vacio}>No tienes recetas pendientes de enviar a farmacia.</Text>
        ) : (
          <FlatList
            data={misConsultas}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.consultaCard}>
                <Text style={styles.consultaFecha}>{item.fecha} · {item.hora}</Text>
                <Text style={styles.consultaMedicamento}>{item.medicamento}</Text>

                {consultaSeleccionadaId !== item.id ? (
                  <CustomButton
                    title="Elegir farmacia"
                    onPress={() => {
                      setConsultaSeleccionadaId(item.id);
                      setFarmaciaSeleccionada(null);
                    }}
                    variant="secondary"
                    style={{ marginTop: 10 }}
                  />
                ) : (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.subtitle}>Farmacia del hospital</Text>
                    {farmaciaHospital && <FarmaciaCard farmacia={farmaciaHospital} />}

                    <Text style={styles.subtitle}>O elige otra farmacia</Text>
                    {otrasFarmacias.map((f) => (
                      <FarmaciaCard key={f.id} farmacia={f} />
                    ))}

                    <CustomButton
                      title={guardando ? 'Guardando...' : 'Confirmar farmacia'}
                      onPress={handleConfirmarFarmacia}
                      disabled={!farmaciaSeleccionada || guardando}
                      style={{ marginTop: 10 }}
                    />
                    <CustomButton
                      title="Cancelar"
                      onPress={() => setConsultaSeleccionadaId(null)}
                      variant="secondary"
                      style={{ marginTop: 8 }}
                    />
                  </View>
                )}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 16 },
  subtitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 16, marginBottom: 8 },
  vacio: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 40 },
  consultaCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  consultaFecha: { fontSize: 13, color: '#6B7280' },
  consultaMedicamento: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 4 },
  farmaciaCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  farmaciaCardSeleccionada: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  farmaciaNombre: { fontSize: 15, fontWeight: '600', color: '#111827' },
  farmaciaDescuento: { fontSize: 12, color: '#16A34A', marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB' },
  radioSeleccionado: { borderColor: '#2563EB', backgroundColor: '#2563EB' },
});