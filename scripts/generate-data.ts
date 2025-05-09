import { Faker, en } from '@faker-js/faker';
import * as fs from 'fs';

const faker = new Faker({ locale: [en] });

// Define 1,000 cities to ensure multiple apartments per city
const cities = Array.from({ length: 1000 }, () => faker.location.city());
const APARTMENTS_COUNT = 50000;
const APPOINTMENTS_COUNT = 200000;

// Generate 50,000 apartments
const apartments = Array.from({ length: APARTMENTS_COUNT }, (_, i) => ({
  id: i + 1,
  owner_id: `owner_${faker.string.uuid()}`,
  monthly_rent: faker.number.int({ min: 500, max: 3000 }),
  city: cities[i % cities.length], // Distribute across 1,000 cities (~50 apartments per city)
  amenities: { pool: faker.datatype.boolean(), gym: faker.datatype.boolean() },
}));

// Generate 200,000 appointments
const appointments = Array.from({ length: APPOINTMENTS_COUNT }, (_, i) => ({
  id: i + 1,
  apartment_id: faker.number.int({ min: 1, max: APARTMENTS_COUNT }),
  start_time: faker.date.recent({ days: 365 }).toISOString().replace('T', ' ').split('.')[0],
  status: faker.helpers.arrayElement(['Confirmado', 'Pendiente', 'Cancelado']),
}));

fs.writeFileSync('apartments.json', JSON.stringify(apartments, null, 2));
fs.writeFileSync('appointments.json', JSON.stringify(appointments, null, 2));
console.log(`Generated ${APARTMENTS_COUNT} apartments across ${cities.length} cities and ${APPOINTMENTS_COUNT} appointments`);