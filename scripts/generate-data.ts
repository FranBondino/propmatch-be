import { Faker, en } from '@faker-js/faker';
import * as fs from 'fs';

const faker = new Faker({ locale: [en] });

// Apartments (maps to Apartment entity)
interface Apartment {
  id: number;
  monthly_rent: number;
  city: string;
  amenities: string[];
  owner_id: string;
}

const apartments: Apartment[] = [];

for (let i = 1; i <= 5000; i++) {
  apartments.push({
    id: i,
    monthly_rent: faker.number.int({ min: 500, max: 2500 }), // $500-$2,500
    city: faker.location.city(), // e.g., "New York"
    amenities: faker.helpers.arrayElements(
      ['Wi-Fi', 'Parking', 'Gym', 'Pet-Friendly', 'Balcony'],
      { min: 1, max: 4 }
    ), // e.g., ["Wi-Fi", "Gym"]
    owner_id: faker.string.uuid(), // Fake User ID, e.g., "123e4567-e89b-12d3-a456-426614174000"
  });
}

// Create data/ folder if it doesn't exist
if (!fs.existsSync('data')) fs.mkdirSync('data');
fs.writeFileSync('data/apartments.json', JSON.stringify(apartments, null, 2));
console.log('Generated 5,000 apartments');

// Appointments (maps to Appointment entity)
interface Appointment {
  renter_id: string;
  apartment_id: number;
  status: 'Pendiente' | 'Confirmado';
  start_time: string;
  end_time: string;
  owner_id: string;
}

const appointments: Appointment[] = [];

for (let i = 0; i < 20000; i++) {
  const startTime = faker.date.recent({ days: 30 }); // Within last 30 days
  appointments.push({
    renter_id: faker.string.uuid(), // Fake User ID
    apartment_id: faker.number.int({ min: 1, max: 5000 }), // Links to apartments
    status: faker.helpers.arrayElement(['Pendiente', 'Confirmado']), // Matches your Appointment.status
    start_time: startTime.toISOString(), // e.g., "2025-04-10T08:15:22.123Z"
    end_time: new Date(startTime.getTime() + 30 * 60 * 1000).toISOString(), // 30min later
    owner_id: faker.string.uuid(), // Fake User ID
  });
}

fs.writeFileSync('data/appointments.json', JSON.stringify(appointments, null, 2));
console.log('Generated 20,000 appointments');