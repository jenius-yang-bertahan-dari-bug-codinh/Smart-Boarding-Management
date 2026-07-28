const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Extracting database records...');
  
  // Extract all data
  const users = await prisma.user.findMany();
  const rooms = await prisma.room.findMany();
  const members = await prisma.member.findMany();
  const complaints = await prisma.complaint.findMany();
  const payments = await prisma.payment.findMany();
  const maintenanceSchedules = await prisma.maintenanceSchedule.findMany();
  const maintenanceRooms = await prisma.maintenanceRoom.findMany();
  const announcements = await prisma.announcement.findMany();
  const profiles = await prisma.boardingHouseProfile.findMany();

  // Helper to format dates correctly in the generated code
  const serializeArray = (arr) => {
    return JSON.stringify(arr, null, 2).replace(/"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)"/g, 'new Date("$1")');
  };

  const seedScript = `// AUTO-GENERATED SEED FILE
// Generated on ${new Date().toISOString()}
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Inserting records...');

  // 1. BoardingHouseProfile
  const profiles = ${serializeArray(profiles)};
  for (const p of profiles) {
    await prisma.boardingHouseProfile.create({ data: p });
  }

  // 2. Users
  const users = ${serializeArray(users)};
  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  // 3. Rooms
  const rooms = ${serializeArray(rooms)};
  for (const r of rooms) {
    await prisma.room.create({ data: r });
  }

  // 4. Members
  const members = ${serializeArray(members)};
  for (const m of members) {
    await prisma.member.create({ data: m });
  }

  // 5. Complaints
  const complaints = ${serializeArray(complaints)};
  for (const c of complaints) {
    await prisma.complaint.create({ data: c });
  }

  // 6. Payments
  const payments = ${serializeArray(payments)};
  for (const p of payments) {
    await prisma.payment.create({ data: p });
  }

  // 7. MaintenanceSchedules
  const maintenanceSchedules: any[] = ${serializeArray(maintenanceSchedules)};
  for (const ms of maintenanceSchedules) {
    await prisma.maintenanceSchedule.create({ data: ms });
  }

  // 8. MaintenanceRooms
  const maintenanceRooms: any[] = ${serializeArray(maintenanceRooms)};
  for (const mr of maintenanceRooms) {
    await prisma.maintenanceRoom.create({ data: mr });
  }

  // 9. Announcements
  const announcements = ${serializeArray(announcements)};
  for (const a of announcements) {
    await prisma.announcement.create({ data: a });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  const targetPath = path.join(__dirname, '..', 'prisma', 'seed.ts');
  fs.writeFileSync(targetPath, seedScript, 'utf8');
  console.log(`Seed script successfully written to ${targetPath}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
