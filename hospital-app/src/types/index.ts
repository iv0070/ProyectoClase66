export type Especialidad =
  | 'odontologia'
  | 'pediatria'
  | 'ortopedia'
  | 'cirugia'
  | 'medicina_general'
  | 'psicologia'
  | 'fisioterapia';

export type EstadoCita =
  | 'pendiente'
  | 'confirmada'
  | 'rechazada'
  | 'completada';

export interface Doctor {
  id: string;
  nombre: string;
  usuario: string;
  contrasena: string;
  especialidad: Especialidad;
}
export interface Paciente {
  id: string;
  nombre: string;
  usuario: string;
  contrasena: string;
  edad: number;
  telefono: string;
  identidad: string;
}

export interface Cita {
  id: string;
  pacienteId: string;
  doctorId: string;
  fecha: string;
  hora: string;
  estado: EstadoCita;
}

export interface Consulta {
  id: string;
  citaId: string;
  pacienteId: string;
  doctorId: string;
  fecha: string;
  hora: string;
  sintomas: string;
  diagnostico: string;
  medicamento: string;
}

export interface Farmacia {
  id: string;
  nombre: string;
  descuento: number;
}
