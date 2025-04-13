import { InMemoryPatientRepository } from '../../repositories/InMemoryPatientRepository';
import { Patient } from '../../models/Patient';

describe('InMemoryPatientRepository', () => {
  let repository: InMemoryPatientRepository;
  let patients: Patient[];

  beforeEach(async () => {
    // Initialize repository with 20 patients for testing
    repository = new InMemoryPatientRepository(20);
    patients = await repository.getAll();
  });

  test('should generate the specified number of patients', async () => {
    expect(patients.length).toBe(20);
    
    // Create a new repository with different count
    const smallerRepo = new InMemoryPatientRepository(5);
    const smallerPatients = await smallerRepo.getAll();
    expect(smallerPatients.length).toBe(5);
  });

  test('should retrieve a patient by ID', async () => {
    // Get a random patient from the list
    const randomPatient = patients[Math.floor(Math.random() * patients.length)];
    const patientId = randomPatient.id;
    
    // Retrieve the patient by ID
    const retrievedPatient = await repository.getById(patientId);
    
    // Check that we got the correct patient
    expect(retrievedPatient).not.toBeNull();
    expect(retrievedPatient?.id).toBe(patientId);
  });

  test('should return null for non-existent ID', async () => {
    const result = await repository.getById('non-existent-id');
    expect(result).toBeNull();
  });

  test('should search patients by various fields', async () => {
    // Get data from a random patient to search for
    const randomPatient = patients[Math.floor(Math.random() * patients.length)];
    
    // Test searching by first name
    const firstNameResults = await repository.search(randomPatient.firstName);
    expect(firstNameResults.length).toBeGreaterThan(0);
    expect(firstNameResults.some(p => p.id === randomPatient.id)).toBe(true);
    
    // Test searching by city
    const cityResults = await repository.search(randomPatient.address.city);
    expect(cityResults.length).toBeGreaterThan(0);
    expect(cityResults.some(p => p.address.city === randomPatient.address.city)).toBe(true);
  });

  test('should sort patients correctly', () => {
    // Sort by lastName ascending
    const sortedByLastName = repository.sort(patients, [
      { field: 'lastName', direction: 'asc' }
    ]);
    
    // Check that the sort is working correctly
    for (let i = 1; i < sortedByLastName.length; i++) {
      const prev = sortedByLastName[i-1].lastName;
      const current = sortedByLastName[i].lastName;
      expect(prev.localeCompare(current)).toBeLessThanOrEqual(0);
    }
    
    // Sort by multiple fields
    const sortedByMultiple = repository.sort(patients, [
      { field: 'gender', direction: 'asc' },
      { field: 'lastName', direction: 'desc' }
    ]);
    
    // Check sorting is consistent within each gender group
    let currentGender = '';
    for (let i = 0; i < sortedByMultiple.length; i++) {
      if (sortedByMultiple[i].gender !== currentGender) {
        currentGender = sortedByMultiple[i].gender;
      } else if (i > 0) {
        // Within the same gender group, last names should be in descending order
        const prev = sortedByMultiple[i-1].lastName;
        const current = sortedByMultiple[i].lastName;
        expect(prev.localeCompare(current)).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('should filter patients correctly', () => {
    // Get a state that has multiple patients
    const state = patients[0].address.state;
    const statePatients = patients.filter(p => p.address.state === state);
    
    // There should be at least one patient with this state for the test to be valid
    expect(statePatients.length).toBeGreaterThan(0);
    
    // Test filtering by that state
    const filtered = repository.filter(patients, {
      'address.state': state
    });
    
    // All results should have the specified state
    expect(filtered.length).toBe(statePatients.length);
    filtered.forEach(patient => {
      expect(patient.address.state).toBe(state);
    });
  });

  test('should group patients correctly', () => {
    // Group by gender
    const groupedByGender = repository.group(patients, ['gender']);
    
    // Check that we have groups for each gender
    expect(Object.keys(groupedByGender).length).toBeGreaterThan(0);
    
    // Verify that each group contains only patients of that gender
    for (const [gender, group] of Object.entries(groupedByGender)) {
      group.patients.forEach(patient => {
        expect(patient.gender).toBe(gender);
      });
    }
    
    // Test multi-level grouping
    const groupedByMultiple = repository.group(patients, ['gender', 'address.state']);
    
    // Check that the nested structure is correct
    for (const [gender, genderGroup] of Object.entries(groupedByMultiple)) {
      // Each gender should have subgroups
      expect(genderGroup.subgroups).toBeDefined();
      
      if (genderGroup.subgroups) {
        for (const [state, stateGroup] of Object.entries(genderGroup.subgroups)) {
          // Verify that each patient in this subgroup has the correct gender and state
          stateGroup.patients.forEach(patient => {
            expect(patient.gender).toBe(gender);
            expect(patient.address.state).toBe(state);
          });
        }
      }
    }
  });
});