import { Patient } from "../models/Patient";

export interface PatientRepository {
  getAll(): Promise<Patient[]>;
  getById(id: string): Promise<Patient | null>;
  search(query: string): Promise<Patient[]>;
  sort(patients: Patient[], criteria: SortCriteria[]): Patient[];
  filter(patients: Patient[], criteria: FilterCriteria): Patient[];
  group(patients: Patient[], groupBy: string[]): GroupedPatients;
}

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterCriteria {
  [field: string]: any;
}

export interface GroupedPatients {
  [key: string]: {
    patients: Patient[];
    subgroups?: GroupedPatients;
  };
}