import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButtom';
import { supabase } from '../../lib/supabase';


interface RegistroPacienteScreenProps {
  navigation?: any;
}

const TOTAL_PASOS = 4;



function calcularEdad(fechaNacimiento: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mes = hoy.getMonth() - fechaNacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }
  return edad;
}

function validarIdentidadHondurena(identidad: string): boolean {
  const formato = /^\d{4}-\d{4}-\d{5}$/;
  return formato.test(identidad);
}

function formatearFecha(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

// ---------- Indicador de progreso (puntos) ----------

function IndicadorProgreso({ pasoActual }: { pasoActual: number }) {
  return (
    <View style={styles.puntosContainer}>
      {Array.from({ length: TOTAL_PASOS }).map((_, index) => {
        const numeroPaso = index + 1;
        const activo = numeroPaso === pasoActual;
        const completado = numeroPaso < pasoActual;
        return (
          <View
            key={numeroPaso}
            style={[
              styles.punto,
              activo && styles.puntoActivo,
              completado && styles.puntoCompletado,
            ]}
          />
        );
      })}
    </View>
  );
}

// ---------- Componente principal ----------

export default function RegistroPacienteScreen({ navigation }: RegistroPacienteScreenProps) {
  const [paso, setPaso] = useState(1);

  // Paso 1: Cuenta
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');

  // Paso 2: Datos personales
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  // Paso 3: Contacto
  const [telefono, setTelefono] = useState('');
  const [identidad, setIdentidad] = useState('');

  // Paso 4: Términos
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleCambiarFecha = (event: any, fechaSeleccionada?: Date) => {
    setMostrarCalendario(Platform.OS === 'ios');
    if (fechaSeleccionada) {
      setFechaNacimiento(fechaSeleccionada);
    }
  };

  const validarPasoActual = (): boolean => {
    if (paso === 1) {
      if (!email.trim() || !email.includes('@')) {
        setError('Ingresa un correo electrónico válido');
        return false;
      }
      if (!contrasena.trim()) {
        setError('La contraseña es obligatoria');
        return false;
      }
      if (contrasena.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
    }

    if (paso === 2) {
      if (!nombre.trim()) {
        setError('El nombre es obligatorio');
        return false;
      }
      if (!apellido.trim()) {
        setError('El apellido es obligatorio');
        return false;
      }
      if (!fechaNacimiento) {
        setError('Selecciona tu fecha de nacimiento');
        return false;
      }
      const edad = calcularEdad(fechaNacimiento);
      if (edad < 0 || edad > 120) {
        setError('La fecha de nacimiento no es válida');
        return false;
      }
    }

    if (paso === 3) {
      if (!identidad.trim()) {
        setError('El número de identidad es obligatorio');
        return false;
      }
      if (!validarIdentidadHondurena(identidad)) {
        setError('La identidad debe tener el formato 0000-0000-00000');
        return false;
      }
    }

    if (paso === 4) {
      if (!aceptaTerminos) {
        setError('Debes aceptar los Términos y Condiciones para continuar');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleSiguiente = () => {
    if (!validarPasoActual()) return;
    setPaso(paso + 1);
  };

  const handleAtras = () => {
    setError('');
    setPaso(paso - 1);
  };

  const handleRegistro = async () => {
    if (!validarPasoActual()) return;

    setCargando(true);

    const usuario = `${nombre.trim().toLowerCase()}.${apellido.trim().toLowerCase()}`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: contrasena,
    });

    if (authError) {
      setCargando(false);
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        setError('Ya existe una cuenta registrada con este correo. Inicia sesión en su lugar.');
      } else if (authError.message.includes('Password')) {
        setError('La contraseña no cumple los requisitos mínimos de seguridad.');
      } else {
        setError('No se pudo crear la cuenta: ' + authError.message);
      }
      return;
    }

    if (!authData.user) {
      setCargando(false);
      setError('No se pudo crear la cuenta, intenta de nuevo');
      return;
    }

    const { error: perfilError } = await supabase.from('perfiles').insert({
      id: authData.user.id,
      rol: 'paciente',
      usuario,
      email: email.trim(),
      nombre: `${nombre.trim()} ${apellido.trim()}`,
      telefono: telefono.trim() || null,
      fecha_nacimiento: fechaNacimiento!.toISOString().split('T')[0],
      identidad: identidad.trim(),
    });

    setCargando(false);

    if (perfilError) {
      setError('La cuenta se creó pero hubo un error guardando el perfil: ' + perfilError.message);
      return;
    }

  
    Alert.alert(
  'Cuenta creada',
  `Bienvenido, ${nombre.trim()}\n\nTu usuario es: ${usuario}\nGuárdalo para iniciar sesión.`,
  [{ text: 'Continuar', onPress: () => navigation?.reset({ index: 0, routes: [{ name: 'PatientTabs' }] }) }]
);
    
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Crear cuenta de paciente</Text>
        <IndicadorProgreso pasoActual={paso} />

        {paso === 1 && (
          <>
            <Text style={styles.pasoTitulo}>Tu cuenta</Text>
            <CustomInput
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              validationType="email"
              placeholder="tucorreo@ejemplo.com"
            />
            <CustomInput
              label="Contraseña"
              value={contrasena}
              onChangeText={setContrasena}
              validationType="password"
              placeholder="••••••••"
            />
          </>
        )}

        {paso === 2 && (
          <>
            <Text style={styles.pasoTitulo}>Datos personales</Text>
            <CustomInput
              label="Nombre"
              value={nombre}
              onChangeText={setNombre}
              validationType="text"
              placeholder="Ashly"
            />
            <CustomInput
              label="Apellido"
              value={apellido}
              onChangeText={setApellido}
              validationType="text"
              placeholder="Cruz"
            />

            <Text style={styles.label}>Fecha de nacimiento</Text>
            <TouchableOpacity
              style={styles.fechaBoton}
              onPress={() => setMostrarCalendario(true)}
            >
              <Text style={fechaNacimiento ? styles.fechaTexto : styles.fechaPlaceholder}>
                {fechaNacimiento ? formatearFecha(fechaNacimiento) : 'Toca para elegir una fecha'}
              </Text>
            </TouchableOpacity>

            {mostrarCalendario && (
              <DateTimePicker
                value={fechaNacimiento ?? new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={handleCambiarFecha}
              />
            )}

            {fechaNacimiento && (
              <Text style={styles.edadCalculada}>
                Edad: {calcularEdad(fechaNacimiento)} años
              </Text>
            )}
          </>
        )}

        {paso === 3 && (
          <>
            <Text style={styles.pasoTitulo}>Contacto</Text>
            <CustomInput
              label="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              validationType="text"
              placeholder="3315-5249"
            />
            <CustomInput
              label="Número de identidad"
              value={identidad}
              onChangeText={setIdentidad}
              validationType="text"
              placeholder="0501-1992-00123"
            />
          </>
        )}

        {paso === 4 && (
          <>
            <Text style={styles.pasoTitulo}>Términos y condiciones</Text>
            <View style={styles.terminosBox}>
              <Text style={styles.terminosTexto}>
                Este es un proyecto académico desarrollado con fines educativos.{'\n\n'}
                La información que ingreses (nombre, identidad, datos de contacto) se
                almacena únicamente para fines de demostración del sistema y no será
                utilizada con propósitos comerciales ni compartida con terceros.{'\n\n'}
                Al continuar, entiendes que esta aplicación es un prototipo y no
                sustituye ningún sistema real de gestión hospitalaria.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setAceptaTerminos(!aceptaTerminos)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, aceptaTerminos && styles.checkboxMarcado]}>
                {aceptaTerminos && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={styles.checkboxTexto}>
                He leído y acepto los Términos y Condiciones y el Aviso de Privacidad
              </Text>
            </TouchableOpacity>
          </>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.botonesFila}>
          {paso > 1 && (
            <CustomButton
              title="Atrás"
              onPress={handleAtras}
              variant="secondary"
              style={styles.botonMitad}
            />
          )}

          {paso < TOTAL_PASOS ? (
            <CustomButton
              title="Siguiente"
              onPress={handleSiguiente}
              variant="primary"
              style={paso > 1 ? styles.botonMitad : styles.botonCompleto}
            />
          ) : (
            <CustomButton
              title={cargando ? 'Creando cuenta...' : 'Crear cuenta'}
              onPress={handleRegistro}
              variant="primary"
              disabled={cargando || !aceptaTerminos}
              loading={cargando}
              style={styles.botonMitad}
            />
          )}
        </View>

        {paso === 1 && (
          <TouchableOpacity
            onPress={() => navigation?.navigate('Login')}
            style={styles.loginContainer}
            activeOpacity={0.5}
          >
            <Text style={styles.loginTexto}>
              ¿Ya tienes una cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F9FAFB' },
  title: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 16 },
  pasoTitulo: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 16 },
  puntosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  punto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 5,
  },
  puntoActivo: {
    backgroundColor: '#2563EB',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  puntoCompletado: {
    backgroundColor: '#93C5FD',
  },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#374151' },
  fechaBoton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  fechaTexto: { fontSize: 16, color: '#111827' },
  fechaPlaceholder: { fontSize: 16, color: '#9CA3AF' },
  edadCalculada: { fontSize: 13, color: '#2563EB', marginBottom: 16 },
  terminosBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  terminosTexto: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxMarcado: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxTexto: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  errorText: { color: '#DC2626', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  botonesFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  botonMitad: { flex: 1 },
  botonCompleto: { flex: 1 },
  loginContainer: { marginTop: 16, alignItems: 'center' },
  loginTexto: { fontSize: 14, color: '#6B7280' },
  loginLink: { color: '#2563EB', fontWeight: '600', textDecorationLine: 'underline' },
});