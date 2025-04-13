export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  insuranceProvider: string;
  insuranceNumber: string;
  medicalConditions: string[];
  lastVisit: Date | null;
  createdAt: Date;
  updatedAt: Date;
}