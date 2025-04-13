import { Patient } from "../models/Patient";
import { FilterCriteria, GroupedPatients, PatientRepository, SortCriteria } from "./PatientRepository";
import { generatePatients } from "../utils/mockDataGenerator";

export class InMemoryPatientRepository implements PatientRepository {
  private patients: Patient[];

  constructor(patientCount: number = 100) {
    this.patients = generatePatients(patientCount);
  }

  async getAll(): Promise<Patient[]> {
    return [...this.patients];
  }

  async getById(id: string): Promise<Patient | null> {
    const patient = this.patients.find(p => p.id === id);
    return patient ? { ...patient } : null;
  }

  async search(query: string): Promise<Patient[]> {
    const lowerQuery = query.toLowerCase();
    return this.patients.filter(patient => 
      patient.firstName.toLowerCase().includes(lowerQuery) ||
      patient.lastName.toLowerCase().includes(lowerQuery) ||
      patient.email.toLowerCase().includes(lowerQuery) ||
      patient.insuranceProvider.toLowerCase().includes(lowerQuery) ||
      patient.address.city.toLowerCase().includes(lowerQuery) ||
      patient.address.state.toLowerCase().includes(lowerQuery)
    );
  }

  sort(patients: Patient[], criteria: SortCriteria[]): Patient[] {
    if (!criteria.length) return [...patients];

    return [...patients].sort((a, b) => {
      for (const { field, direction } of criteria) {
        const valueA = this.getNestedValue(a, field);
        const valueB = this.getNestedValue(b, field);
        
        if (valueA === valueB) continue;
        
        // Handle null/undefined values
        if (valueA == null && valueB != null) return direction === 'asc' ? -1 : 1;
        if (valueA != null && valueB == null) return direction === 'asc' ? 1 : -1;
        
        // Date comparison
        if (valueA instanceof Date && valueB instanceof Date) {
          const comparison = valueA.getTime() - valueB.getTime();
          return direction === 'asc' ? comparison : -comparison;
        }
        
        // String/number comparison
        const comparison = String(valueA).localeCompare(String(valueB));
        return direction === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
  }

  filter(patients: Patient[], criteria: FilterCriteria): Patient[] {
    return patients.filter(patient => {
      for (const [field, value] of Object.entries(criteria)) {
        const patientValue = this.getNestedValue(patient, field);
        
        if (patientValue == null) return false;
        
        if (Array.isArray(patientValue)) {
          if (!patientValue.includes(value)) return false;
        } else if (patientValue instanceof Date && value instanceof Date) {
          if (patientValue.getTime() !== value.getTime()) return false;
        } else if (patientValue !== value) {
          return false;
        }
      }
      return true;
    });
  }

  group(patients: Patient[], groupBy: string[]): GroupedPatients {
    if (!groupBy.length) return { all: { patients } };
    
    const result: GroupedPatients = {};
    const currentField = groupBy[0];
    const remainingFields = groupBy.slice(1);
    
    for (const patient of patients) {
      const value = this.getNestedValue(patient, currentField);
      const key = value?.toString() || 'null';
      
      if (!result[key]) {
        result[key] = { patients: [] };
      }
      
      result[key].patients.push(patient);
    }
    
    // Recursively group by remaining fields
    if (remainingFields.length > 0) {
      for (const key of Object.keys(result)) {
        result[key].subgroups = this.group(result[key].patients, remainingFields);
      }
    }
    
    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let value = obj;
    
    for (const key of keys) {
      if (value == null) return null;
      value = value[key];
    }
    
    return value;
  }
}