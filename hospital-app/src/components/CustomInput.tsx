import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ValidationType = 'text' | 'email' | 'password';

interface CustomInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  validationType?: ValidationType;
  required?: boolean;
}

export default function CustomInput({
  label,
  value,
  onChangeText,
  validationType = 'text',
  required = true,
  ...rest
}: CustomInputProps) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const validate = (text: string) => {
    if (required && text.trim() === '') {
      setError('Este campo es obligatorio');
      return;
    }
    if (validationType === 'email' && text.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(text)) {
        setError('Ingresa un correo válido');
        return;
      }
    }
    if (validationType === 'password' && text.trim() !== '') {
      if (text.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }
    setError('');
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
    if (touched) {
      validate(text);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    validate(value);
  };

  const esPassword = validationType === 'password';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, esPassword && styles.inputConIcono, error ? styles.inputError : null]}
          value={value}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          secureTextEntry={esPassword && !mostrarContrasena}
          keyboardType={validationType === 'email' ? 'email-address' : 'default'}
          autoCapitalize={validationType === 'email' ? 'none' : 'sentences'}
          placeholderTextColor="#9CA3AF"
          {...rest}
        />
        {esPassword && (
          <TouchableOpacity
            style={styles.iconoOjo}
            onPress={() => setMostrarContrasena(!mostrarContrasena)}
          >
            <Ionicons
              name={mostrarContrasena ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputConIcono: {
    paddingRight: 44,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  iconoOjo: {
    position: 'absolute',
    right: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 4,
  },
});