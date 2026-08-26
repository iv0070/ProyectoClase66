import { Doctor, Paciente, Cita, Consulta, Farmacia } from '../types';

export const doctores: Doctor[] = [
  {
    id: 'd1',
    nombre: 'Dra. Carla Mejía',
    usuario: 'carla.mejia',
    contrasena: '123456',
    especialidad: 'pediatria',
  },
  {
    id: 'd2',
    nombre: 'Dr. Luis Ramírez',
    usuario: 'luis.ramirez',
    contrasena: '123456',
    especialidad: 'medicina_general',
  },
  {
    id: 'd3',
    nombre: 'Dra. Andrea Zúniga',
    usuario: 'andrea.zuniga',
    contrasena: '123456',
    especialidad: 'odontologia',
  },
];

export const pacientes: Paciente[] = [
  {
    id: 'p1',
    nombre: 'José Martínez',
    usuario: 'jose.martinez',
    contrasena: '123456',
    edad: 34,
    telefono: '9999-0001',
  },
  {
    id: 'p2',
    nombre: 'María Flores',
    usuario: 'maria.flores',
    contrasena: '123456',
    edad: 67,
    telefono: '9999-0002',
  },
  {
    id: 'p3',
    nombre: 'Diego Sosa',
    usuario: 'diego.sosa',
    contrasena: '123456',
    edad: 8,
    telefono: '9999-0003',
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
  { id: 'f2', nombre: 'Farmacias Simán', descuento: 10 },
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