'use client';

import { useEffect, useState } from 'react';
import DataGrid from './components/DataGrid/DataGrid';
import { Column } from './components/DataGrid/types';
import { Patient } from './models/Patient';
import { InMemoryPatientRepository } from './repositories/InMemoryPatientRepository';

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load patient data on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const repository = new InMemoryPatientRepository(100); // Generate 100 patients
        const data = await repository.getAll();
        setPatients(data);
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Define our columns for the patient grid
  const patientColumns: Column<Patient>[] = [
    {
      field: 'id',
      header: 'Patient ID',
      width: '120px',
      sortable: true,
      groupable: false
    },
    {
      field: 'firstName',
      header: 'First Name',
      sortable: true,
      groupable: true
    },
    {
      field: 'lastName',
      header: 'Last Name',
      sortable: true,
      groupable: true
    },
    {
      field: 'dateOfBirth',
      header: 'Date of Birth',
      sortable: true,
      groupable: false,
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      field: 'gender',
      header: 'Gender',
      sortable: true,
      groupable: true
    },
    {
      field: 'email',
      header: 'Email',
      sortable: true,
      groupable: false
    },
    {
      field: 'phone',
      header: 'Phone',
      sortable: true,
      groupable: false
    },
    {
      field: 'address.city',
      header: 'City',
      sortable: true,
      groupable: true
    },
    {
      field: 'address.state',
      header: 'State',
      sortable: true,
      groupable: true
    },
    {
      field: 'insuranceProvider',
      header: 'Insurance',
      sortable: true,
      groupable: true
    },
    {
      field: 'lastVisit',
      header: 'Last Visit',
      sortable: true,
      groupable: false,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Never'
    },
    {
      field: 'medicalConditions',
      header: 'Medical Conditions',
      sortable: false,
      groupable: false,
      render: (value) => Array.isArray(value) ? value.join(', ') : '-'
    }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6">
      <div className="w-full max-w-7xl">
        <h1 className="text-3xl font-bold mb-4">Advanced Patient DataGrid</h1>
        <p className="mb-6">
          This grid demonstrates advanced features including column visibility control, 
          multi-column sorting, grouping, and layout saving.
        </p>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p>Loading patient data...</p>
          </div>
        ) : (
          <DataGrid<Patient>
            data={patients}
            columns={patientColumns}
            keyField="id"
            defaultLayout={{
              visibleColumns: ['id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'insuranceProvider', 'lastVisit'],
              sort: [],
              groupBy: []
            }}
          />
        )}
      </div>
    </main>
  );
}
