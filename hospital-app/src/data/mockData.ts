import { Doctor, Paciente, Cita, Consulta, Farmacia, Recepcionista } from '../types';

export const doctores: Doctor[] = [
  {
    id: 'd1',
    nombre: 'Dra. Karla Mejía',
    usuario: 'carla.mejia',
    contrasena: '123456',
    especialidad: 'pediatria',
  },
  {
    id: 'd2',
    nombre: 'Dr. Ramírez',
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
  {
    id: 'd4',
    nombre: 'Dr. Eduardo López',
    usuario: 'eduardo.lopez',
    contrasena: 'HIJKLM',
    especialidad: 'cirugia',
  },
  {
    id: 'd5',
    nombre: 'Dr. Sergio Amaya',
    usuario: 'sergio.amaya',
    contrasena: 'NOPQRS',
    especialidad: 'ortopedia',
  },
  {
    id: 'd6',
    nombre: 'Psic. Soany García',
    usuario: 'soany.garcia',
    contrasena: 'TUVWXY',
    especialidad: 'psicologia',
  },
  {
    id: 'd7',
    nombre: 'Fisot. Alejandra Medrano',
    usuario: 'ale.medrano',
    contrasena: '565656',
    especialidad: 'fisioterapia',
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
  {
    id: 'p4',
    nombre: 'Ivana Trujillo',
    usuario: 'iva.trujillo',
    contrasena: '343434',
    edad: 19,
    telefono: '9878-0917',
    identidad: '0501-2007-00898',
  },
  {
    id: 'p5',
    nombre: 'Alex Padilla',
    usuario: 'ale.padilla',
    contrasena: '544321',
    edad: 15,
    telefono: '9212,9780',
    identidad: '0501-2011-00431',
  },
  {
    id: 'p6',
    nombre: 'Saidelin Gomez',
    usuario: 'saidelin.gomez',
    contrasena: '098765',
    edad: 16,
    telefono: '9071-5567',
    identidad: '0501-2018-00790',
  },
  {
    id: 'p7',
    nombre: 'Angie Hernández',
    usuario: 'angie.hrndz',
    contrasena: '000888',
    edad: 22,
    telefono: '8844-0076',
    identidad: '0501-2004-00785',
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
    fecha: '2026-09-27',
    hora: '09:00 a.m',
    estado: 'pendiente',
  },
  {
    id: 'c2',
    pacienteId: 'p2',
    doctorId: 'd2',
    fecha: '2026-09-28',
    hora: '10:30 a.m',
    estado: 'confirmada',
  },
  {
    id: 'c3',
    pacienteId: 'p3',
    doctorId: 'd1',
    fecha: '2026-09-29',
    hora: '11:00 a.m',
    estado: 'pendiente',
  },
  {
    id: 'c4',
    pacienteId: 'p4',
    doctorId: 'd4',
    fecha: '2026-09-30',
    hora: '5:00 p.m',
    estado: 'rechazada',
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
  odontologia: 550,
  pediatria: 900,
  ortopedia: 800,
  cirugia: 800,
  medicina_general: 350,
  psicologia: 900,
  fisioterapia: 800,
};

// el id del paciente que inici sesion (se actualiza en el login)
export let pacienteActualId: string = pacientes[0].id;

export function setPacienteActual(id: string) {
  pacienteActualId = id;
}

//recuerda el id del doctor que inicio sesion (se actualiza en el login)
export let doctorActualId: string = doctores[0].id;

export function setDoctorActual(id: string) {
  doctorActualId = id;
}