import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { consultas, farmacias, pacientes } from '../data/mockData';
import { Farmacia } from '../types';
import CustomButton from '../components/CustomButtom';

const pacienteActual = pacientes[0];

export default function RecetasScreen() {
  const [farmaciaSeleccionada, setFarmaciaSeleccionada] = useState<string | null>(null);

  const misConsultas = consultas.filter((c) => c.pacienteId === pacienteActual.id);
  const ultimaConsulta = misConsultas[misConsultas.length - 1];

  const farmaciaHospital = farmacias.find((f) => f.nombre === 'Farmacia del Hospital');
  const otrasFarmacias = farmacias.filter((f) => f.nombre !== 'Farmacia del Hospital');

  const handleConfirmarFarmacia = () => {
    const farmacia = farmacias.find((f) => f.id === farmaciaSeleccionada);
    if (!farmacia) return;

    Alert.alert(
      'Receta enviada',
      `Tu receta fue enviada a ${farmacia.nombre}.\nDescuento por referido: ${farmacia.descuento}%.`
    );
  };

  function FarmaciaCard({ farmacia }: { farmacia: Farmacia }) {
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
        <Text style={styles.title}>Mi receta</Text>

        {!ultimaConsulta ? (
          <Text style={styles.vacio}>No tienes ninguna receta activa por ahora.</Text>
        ) : (
          <>
            <Text style={styles.subtitle}>Farmacia del hospital</Text>
            {farmaciaHospital && <FarmaciaCard farmacia={farmaciaHospital} />}

            <Text style={styles.subtitle}>O elige otra farmacia</Text>
            <FlatList
              data={otrasFarmacias}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <FarmaciaCard farmacia={item} />}
              scrollEnabled={false}
            />

            <CustomButton
              title="Confirmar farmacia"
              onPress={handleConfirmarFarmacia}
              disabled={!farmaciaSeleccionada}
              style={{ marginTop: 16 }}
            />
          </>
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
  farmaciaCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  farmaciaCardSeleccionada: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  farmaciaNombre: { fontSize: 15, fontWeight: '600', color: '#111827' },
  farmaciaDescuento: { fontSize: 12, color: '#16A34A', marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB' },
  radioSeleccionado: { borderColor: '#2563EB', backgroundColor: '#2563EB' },
});