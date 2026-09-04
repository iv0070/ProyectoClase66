import { Doctor, Paciente, Cita, Consulta, Farmacia, Recepcionista } from '../types';

export const doctores: Doctor[] = [
  {
    id: 'd1',
    nombre: 'Dra. Carla Mejia',
    usuario: 'carla.mejia',
    contrasena: '123456',
    especialidad: 'pediatria',
  },
  {
    id: 'd2',
    nombre: 'Dr. Luis Ramirez',
    usuario: 'luis.ramirez',
    contrasena: 'ABCDEF',
    especialidad: 'medicina_general',
  },
  {
    id: 'd3',
    nombre: 'Dra. Andrea Zuniga',
    usuario: 'andrea.zuniga',
    contrasena: 'GHIJKL',
    especialidad: 'odontologia',
  },
];

export const pacientes: Paciente[] = [
  {
    id: 'p1',
    nombre: ' Ashly Cruz',
    usuario: 'ashly.cruz',
    contrasena: '123456',
    edad: 34,
    telefono: '3315-5249',
    identidad: '0501-1992-00123',
  },
  {
    id: 'p2',
    nombre: 'Maria Jose Salinas',
    usuario: 'majo.salinas',
    contrasena: '7891011',
    edad: 67,
    telefono: '9880-1938',
    identidad: '0501-1959-00456',
  },
  {
    id: 'p3',
    nombre: 'Diego Sosa',
    usuario: 'diego.sosa',
    contrasena: '909090',
    edad: 8,
    telefono: '9234-2343',
    identidad: '0501-2018-00789',
  },
];

export const recepcionistas: Recepcionista[] = [
  {
    id: 'r1',
    nombre: 'Daniel Martinez',
    usuario: 'daniel.martinez',
    contrasena: '456123',
  },
];

export const citas: Cita[] = [
  {
    id: 'c1',
    pacienteId: 'p1',
    doctorId: 'd2',
    fecha: '2026-08-27',
    hora: '09:00',
    estado: 'pendiente',
  },
  {
    id: 'c2',
    pacienteId: 'p2',
    doctorId: 'd2',
    fecha: '2026-08-27',
    hora: '10:30',
    estado: 'confirmada',
  },
  {
    id: 'c3',
    pacienteId: 'p3',
    doctorId: 'd1',
    fecha: '2026-08-27',
    hora: '11:00',
    estado: 'pendiente',
  },
];

export const consultas: Consulta[] = [
  {
    id: 'con1',
    citaId: 'c2',
    pacienteId: 'p2',
    doctorId: 'd2',
    fecha: '2026-08-20',
    hora: '09:00',
    sintomas: 'Dolor de cabeza y fiebre',
    diagnostico: 'Infección viral leve',
    medicamento: 'Paracetamol 500mg',
  },
];

export const farmacias: Farmacia[] = [
  { id: 'f1', nombre: 'Farmacia del Hospital', descuento: 15 },
  { id: 'f2', nombre: 'Farmacias Siman', descuento: 10 },
  { id: 'f3', nombre: 'Farmacia Ahorro', descuento: 8 },
];

export const costosPorEspecialidad: Record<string, number> = {
  odontologia: 450,
  pediatria: 400,
  ortopedia: 500,
  cirugia: 800,
  medicina_general: 350,
  psicologia: 450,
  fisioterapia: 400,
};