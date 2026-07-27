// AUTO-GENERATED SEED FILE
// Generated on 2026-07-25T06:46:34.535Z
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Inserting records...');

  // 1. BoardingHouseProfile
  const profiles = [
  {
    "id": 1,
    "name": "PapiKost",
    "description": "",
    "facilities": "[{\"id\":1,\"name\":\"High-Speed Wi-Fi\",\"description\":\"Stay connected with dedicated gigabit fiber internet...\",\"icon\":\"Wifi\"},{\"id\":2,\"name\":\"Laundry Services\",\"description\":\"24/7 self-service laundry room equipped...\",\"icon\":\"WashingMachine\"},{\"id\":3,\"name\":\"24/7 Security\",\"description\":\"Advanced biometric access...\",\"icon\":\"ShieldCheck\"},{\"id\":4,\"name\":\"Modern Gym\",\"description\":\"Fully equipped fitness center...\",\"icon\":\"Dumbbell\"},{\"id\":1784710003148,\"name\":\"Cafe\",\"description\":\"Cafe\",\"icon\":\"Coffee\"}]",
    "maps_location_url": null,
    "contact_info": ""
  }
];
  for (const p of profiles) {
    await prisma.boardingHouseProfile.create({ data: p });
  }

  // 2. Users
  const users = [
  {
    "id": 2,
    "email": "papikost123@gmail.com",
    "password": "$2b$10$X8zsdhKdYRCHAVdlIgQG1evyO1FqSfHTNB0j76RFdoIR2G7ZVgi9W",
    "role": "admin",
    "avatar_url": null,
    "reset_token": null,
    "reset_token_expiry": null
  },
  {
    "id": 15,
    "email": "adventurecreature99@gmail.com",
    "password": "$2b$10$KovLiXtohC7RWeYd62eEhe9OiCrd2P8/X4chmLvA6u5ReQOCIKwVS",
    "role": "tenant",
    "avatar_url": "",
    "reset_token": null,
    "reset_token_expiry": null
  }
];
  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  // 3. Rooms
  const rooms = [
  {
    "id": 1,
    "room_number": "101",
    "floor": 1,
    "type": "Deluxe",
    "price": 1600000,
    "status": "Occupied",
    "features": "[\"Double Bed\",\"En-suite\",\"Workspace\"]",
    "imageUrl": "/assets/rooms/room_101.png"
  },
  {
    "id": 2,
    "room_number": "102",
    "floor": 1,
    "type": "Suite",
    "price": 1400000,
    "status": "Available",
    "features": "[\"Queen Bed\",\"Smart TV\",\"Sofa\"]",
    "imageUrl": "/assets/rooms/room_102.png"
  },
  {
    "id": 7,
    "room_number": "103",
    "floor": 1,
    "type": "Suite",
    "price": 2000000,
    "status": "Available",
    "features": "[\"AC\",\"WiFi\",\"Private Bathroom\"]",
    "imageUrl": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"
  },
  {
    "id": 8,
    "room_number": "104",
    "floor": 1,
    "type": "Deluxe",
    "price": 1650000,
    "status": "Available",
    "features": "[\"AC\",\"WiFi\",\"Private Bathroom\"]",
    "imageUrl": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"
  },
  {
    "id": 9,
    "room_number": "105",
    "floor": 1,
    "type": "Standard",
    "price": 1300000,
    "status": "Available",
    "features": "[\"AC\",\"WiFi\",\"Private Bathroom\"]",
    "imageUrl": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"
  },
  {
    "id": 10,
    "room_number": "106",
    "floor": 1,
    "type": "VIP",
    "price": 5000000,
    "status": "Available",
    "features": "[\"AC\",\"WiFi\",\"Private Bathroom\"]",
    "imageUrl": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"
  }
];
  for (const r of rooms) {
    await prisma.room.create({ data: r });
  }

  // 4. Members
  const members = [
  {
    "id": 14,
    "user_id": 15,
    "room_id": 1,
    "name": "Fathan",
    "phone": "+6287838079999",
    "status": "active",
    "due_date": new Date("2026-07-31T00:00:00.000Z"),
    "id_number": "1234567890123456",
    "avatar_url": ""
  }
];
  for (const m of members) {
    await prisma.member.create({ data: m });
  }

  // 5. Complaints
  const complaints: Prisma.ComplaintUncheckedCreateInput[] = [];
  for (const c of complaints) {
    await prisma.complaint.create({ data: c });
  }

  // 6. Payments
  const payments = [
  {
    "id": 16,
    "member_id": 14,
    "amount": 1650000,
    "payment_method": "bank_transfer",
    "status": "paid",
    "payment_date": new Date("2026-07-24T11:23:56.488Z"),
    "due_date": new Date("2026-07-24T10:57:24.329Z"),
    "billing_month": null,
    "gateway_reference": "INV-16-1784891169177|https://app.sandbox.midtrans.com/snap/v4/redirection/db91d839-c11a-43fb-b71d-d98fb8a0ef1c"
  }
];
  for (const p of payments) {
    await prisma.payment.create({ data: p });
  }

  // 7. MaintenanceSchedules
  const maintenanceSchedules: Prisma.MaintenanceScheduleUncheckedCreateInput[] = [];
  for (const ms of maintenanceSchedules) {
    await prisma.maintenanceSchedule.create({ data: ms });
  }

  // 8. MaintenanceRooms
  const maintenanceRooms: Prisma.MaintenanceRoomUncheckedCreateInput[] = [];
  for (const mr of maintenanceRooms) {
    await prisma.maintenanceRoom.create({ data: mr });
  }

  // 9. Announcements
  const announcements = [
  {
    "id": 1,
    "title": "Test",
    "body": "PERHATIAN REKAN SATU KOST",
    "expiry_date": new Date("2026-08-21T02:53:27.256Z")
  },
  {
    "id": 2,
    "title": "TEST2",
    "body": "mbut",
    "expiry_date": new Date("2026-07-23T02:56:14.841Z")
  },
  {
    "id": 3,
    "title": "TEST3",
    "body": "woi bayar kost\n",
    "expiry_date": new Date("2026-07-23T02:56:57.970Z")
  },
  {
    "id": 4,
    "title": "UNTUK MASALAH AC",
    "body": "klo ada apa apa tolong tulis di maintenance",
    "expiry_date": new Date("2026-07-23T02:58:06.682Z")
  },
  {
    "id": 5,
    "title": "sadf",
    "body": "asdfsdafads",
    "expiry_date": new Date("2026-07-23T02:58:13.691Z")
  },
  {
    "id": 6,
    "title": "sadfsdafds",
    "body": "sadfdsaf",
    "expiry_date": new Date("2026-07-23T02:58:17.534Z")
  },
  {
    "id": 7,
    "title": "SIGMA",
    "body": "SIGMA",
    "expiry_date": new Date("2026-07-23T02:58:24.852Z")
  }
];
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