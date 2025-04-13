import { Patient } from '../models/Patient';

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa',
  'Anthony', 'Margaret', 'Mark', 'Betty', 'Donald', 'Dorothy', 'Steven', 'Sandra'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson',
  'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
  'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee',
  'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'San Francisco', 'Columbus', 'Indianapolis', 'Fort Worth', 'Charlotte', 'Seattle'
];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const insuranceProviders = [
  'Aetna', 'BlueCross BlueShield', 'Cigna', 'Humana', 'Kaiser Permanente',
  'UnitedHealthcare', 'Medicare', 'Medicaid', 'Anthem', 'Centene'
];

const medicalConditions = [
  'Hypertension', 'Diabetes', 'Asthma', 'Arthritis', 'Depression', 'Anxiety',
  'Obesity', 'Insomnia', 'Allergies', 'GERD', 'Migraine', 'Osteoporosis',
  'Hypothyroidism', 'COPD', 'Heart Disease', 'None'
];

function getRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomMultiple<T>(array: T[], max = 3): T[] {
  const count = Math.floor(Math.random() * max) + 1;
  const result: T[] = [];
  const availableItems = [...array];
  
  for (let i = 0; i < count; i++) {
    if (availableItems.length === 0) break;
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    result.push(availableItems[randomIndex]);
    availableItems.splice(randomIndex, 1);
  }
  
  return result;
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomPhone(): string {
  return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
}

function getRandomZipCode(): string {
  return `${Math.floor(Math.random() * 90000) + 10000}`;
}

function generatePatient(id: string): Patient {
  const firstName = getRandom(firstNames);
  const lastName = getRandom(lastNames);
  const gender = getRandom(['male', 'female', 'other']) as 'male' | 'female' | 'other';
  const createdAt = getRandomDate(new Date(2020, 0, 1), new Date());
  const hasLastVisit = Math.random() > 0.2;
  
  return {
    id,
    firstName,
    lastName,
    dateOfBirth: getRandomDate(new Date(1940, 0, 1), new Date(2005, 0, 1)),
    gender,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`.replace(' ', ''),
    phone: getRandomPhone(),
    address: {
      street: `${Math.floor(Math.random() * 9000) + 1000} Main St.`,
      city: getRandom(cities),
      state: getRandom(states),
      zipCode: getRandomZipCode(),
      country: 'United States',
    },
    insuranceProvider: getRandom(insuranceProviders),
    insuranceNumber: `INS-${Math.floor(Math.random() * 900000) + 100000}`,
    medicalConditions: getRandomMultiple(medicalConditions),
    lastVisit: hasLastVisit ? getRandomDate(createdAt, new Date()) : null,
    createdAt,
    updatedAt: getRandomDate(createdAt, new Date()),
  };
}

export function generatePatients(count: number): Patient[] {
  return Array.from({ length: count }).map((_, index) => 
    generatePatient(`P-${(index + 1).toString().padStart(5, '0')}`)
  );
}