import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import CustomButton from '../components/CustomButtom';
import CustomInput from '../components/CustomInput';

interface Perfil {
  nombre: string;
  usuario: string;
  telefono: string | null;
  identidad: string | null;
  direccion: string | null;
  tipo_sangre: string | null;
  alergias: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  seguro_medico: string | null;
}

export default function PerfilScreen({ navigation }: { navigation?: any }) {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState(false);

  const [direccion, setDireccion] = useState('');
  const [tipoSangre, setTipoSangre] = useState('');
  const [alergias, setAlergias] = useState('');
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [seguroMedico, setSeguroMedico] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [mostrarCambioPassword, setMostrarCambioPassword] = useState(false);
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  const cargarPerfil = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setCargando(false);
      return;
    }

    const { data } = await supabase
      .from('perfiles')
      .select('nombre, usuario, telefono, identidad, direccion, tipo_sangre, alergias, contacto_emergencia_nombre, contacto_emergencia_telefono, seguro_medico')
      .eq('id', user.id)
      .single();

    if (data) {
      setPerfil(data);
      setDireccion(data.direccion ?? '');
      setTipoSangre(data.tipo_sangre ?? '');
      setAlergias(data.alergias ?? '');
      setContactoNombre(data.contacto_emergencia_nombre ?? '');
      setContactoTelefono(data.contacto_emergencia_telefono ?? '');
      setSeguroMedico(data.seguro_medico ?? '');
    }
    setCargando(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [cargarPerfil])
  );

  const perfilIncompleto = perfil && (!perfil.direccion || !perfil.tipo_sangre || !perfil.contacto_emergencia_nombre);

  const handleGuardarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setGuardando(true);
    const { error } = await supabase
      .from('perfiles')
      .update({
        direccion: direccion.trim() || null,
        tipo_sangre: tipoSangre.trim() || null,
        alergias: alergias.trim() || null,
        contacto_emergencia_nombre: contactoNombre.trim() || null,
        contacto_emergencia_telefono: contactoTelefono.trim() || null,
        seguro_medico: seguroMedico.trim() || null,
      })
      .eq('id', user.id);

    setGuardando(false);

    if (!error) {
      setEditando(false);
      cargarPerfil();
      Alert.alert('Listo', 'Tu perfil se actualizó correctamente.');
    }
  };

  const handleCambiarContrasena = async () => {
    if (!nuevaContrasena.trim() || nuevaContrasena.length < 6) {
      setErrorPassword('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setErrorPassword('Las contraseñas no coinciden');
      return;
    }
    setErrorPassword('');
    setGuardandoPassword(true);
    const { error } = await supabase.auth.updateUser({ password: nuevaContrasena });
    setGuardandoPassword(false);
    if (error) {
      setErrorPassword('No se pudo cambiar: ' + error.message);
      return;
    }
    setNuevaContrasena('');
    setConfirmarContrasena('');
    setMostrarCambioPassword(false);
    Alert.alert('Listo', 'Tu contraseña se actualizó correctamente.');
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
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mi perfil</Text>

        {perfil && (
          <View style={styles.card}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.valor}>{perfil.nombre}</Text>
            <Text style={styles.label}>Usuario</Text>
            <Text style={styles.valor}>{perfil.usuario}</Text>
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.valor}>{perfil.telefono ?? 'No especificado'}</Text>
            <Text style={styles.label}>Identidad</Text>
            <Text style={styles.valor}>{perfil.identidad ?? 'No especificada'}</Text>
          </View>
        )}

        {perfilIncompleto && !editando && (
          <View style={styles.avisoBox}>
            <Text style={styles.avisoTexto}>
              Te falta completar información de tu perfil (dirección, tipo de sangre, contacto de emergencia).
            </Text>
            <CustomButton
              title="Completar perfil"
              onPress={() => setEditando(true)}
              variant="primary"
              style={{ marginTop: 10 }}
            />
          </View>
        )}

        {!editando && !perfilIncompleto && (
          <CustomButton
            title="Editar información adicional"
            onPress={() => setEditando(true)}
            variant="secondary"
            style={{ marginTop: 16 }}
          />
        )}

        {editando && (
          <View style={styles.card}>
            <Text style={styles.pasoTitulo}>Información adicional</Text>
            <CustomInput label="Dirección" value={direccion} onChangeText={setDireccion} validationType="text" required={false} placeholder="Col. Ejemplo, calle..." />
            <CustomInput label="Tipo de sangre" value={tipoSangre} onChangeText={setTipoSangre} validationType="text" required={false} placeholder="O+" />
            <CustomInput label="Alergias" value={alergias} onChangeText={setAlergias} validationType="text" required={false} placeholder="Penicilina, mariscos..." />
            <CustomInput label="Contacto de emergencia" value={contactoNombre} onChangeText={setContactoNombre} validationType="text" required={false} placeholder="Nombre" />
            <CustomInput label="Teléfono de emergencia" value={contactoTelefono} onChangeText={setContactoTelefono} validationType="text" required={false} placeholder="9999-0000" />
            <CustomInput label="Seguro médico" value={seguroMedico} onChangeText={setSeguroMedico} validationType="text" required={false} placeholder="Ninguno" />

            <CustomButton
              title={guardando ? 'Guardando...' : 'Guardar'}
              onPress={handleGuardarPerfil}
              variant="primary"
              disabled={guardando}
              loading={guardando}
            />
            <CustomButton title="Cancelar" onPress={() => setEditando(false)} variant="secondary" style={{ marginTop: 8 }} />
          </View>
        )}

        {!mostrarCambioPassword ? (
          <CustomButton
            title="Cambiar contraseña"
            onPress={() => setMostrarCambioPassword(true)}
            variant="secondary"
            style={{ marginTop: 20 }}
          />
        ) : (
          <View style={styles.card}>
            <CustomInput label="Nueva contraseña" value={nuevaContrasena} onChangeText={setNuevaContrasena} validationType="password" placeholder="••••••••" />
            <CustomInput label="Confirmar nueva contraseña" value={confirmarContrasena} onChangeText={setConfirmarContrasena} validationType="password" placeholder="••••••••" />
            {errorPassword ? <Text style={styles.errorText}>{errorPassword}</Text> : null}
            <CustomButton
              title={guardandoPassword ? 'Guardando...' : 'Guardar nueva contraseña'}
              onPress={handleCambiarContrasena}
              variant="primary"
              disabled={guardandoPassword}
              loading={guardandoPassword}
            />
            <CustomButton title="Cancelar" onPress={() => setMostrarCambioPassword(false)} variant="secondary" style={{ marginTop: 8 }} />
          </View>
        )}

        <CustomButton
          title="Cerrar sesión"
          onPress={handleCerrarSesion}
          variant="danger"
          style={{ marginTop: 20, marginBottom: 30 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 20 },
  cargando: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  pasoTitulo: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12 },
  label: { fontSize: 12, color: '#9CA3AF', marginTop: 12 },
  valor: { fontSize: 16, color: '#111827', fontWeight: '600' },
  avisoBox: { backgroundColor: '#FEF3C7', borderRadius: 10, padding: 14, marginBottom: 16 },
  avisoTexto: { fontSize: 13, color: '#92400E' },
  errorText: { color: '#DC2626', fontSize: 14, marginBottom: 12, textAlign: 'center' },
});