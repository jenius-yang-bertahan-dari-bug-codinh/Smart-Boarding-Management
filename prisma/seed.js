const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = {
  "users": [
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
  ],
  "rooms": [
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
  ],
  "members": [
    {
      "id": 14,
      "user_id": 15,
      "room_id": 1,
      "name": "Fathan",
      "phone": "+6287838079999",
      "status": "active",
      "due_date": "2026-07-31T00:00:00.000Z",
      "id_number": "1234567890123456",
      "avatar_url": ""
    }
  ],
  "complaints": [],
  "payments": [
    {
      "id": 16,
      "member_id": 14,
      "amount": 1650000,
      "payment_method": "bank_transfer",
      "status": "paid",
      "payment_date": "2026-07-24T11:23:56.488Z",
      "due_date": "2026-07-24T10:57:24.329Z",
      "billing_month": null,
      "gateway_reference": "INV-16-1784891169177|https://app.sandbox.midtrans.com/snap/v4/redirection/db91d839-c11a-43fb-b71d-d98fb8a0ef1c"
    }
  ],
  "maintenanceSchedules": [],
  "maintenanceRooms": [],
  "announcements": [
    {
      "id": 1,
      "title": "Test",
      "body": "PERHATIAN REKAN SATU KOST",
      "expiry_date": "2026-08-21T02:53:27.256Z"
    },
    {
      "id": 2,
      "title": "TEST2",
      "body": "mbut",
      "expiry_date": "2026-07-23T02:56:14.841Z"
    },
    {
      "id": 3,
      "title": "TEST3",
      "body": "woi bayar kost\n",
      "expiry_date": "2026-07-23T02:56:57.970Z"
    },
    {
      "id": 4,
      "title": "UNTUK MASALAH AC",
      "body": "klo ada apa apa tolong tulis di maintenance",
      "expiry_date": "2026-07-23T02:58:06.682Z"
    },
    {
      "id": 5,
      "title": "sadf",
      "body": "asdfsdafads",
      "expiry_date": "2026-07-23T02:58:13.691Z"
    },
    {
      "id": 6,
      "title": "sadfsdafds",
      "body": "sadfdsaf",
      "expiry_date": "2026-07-23T02:58:17.534Z"
    },
    {
      "id": 7,
      "title": "SIGMA",
      "body": "SIGMA",
      "expiry_date": "2026-07-23T02:58:24.852Z"
    }
  ],
  "profiles": [
    {
      "id": 1,
      "name": "PapiKost",
      "description": "",
      "facilities": "[{\"id\":1,\"name\":\"High-Speed Wi-Fi\",\"description\":\"Stay connected with dedicated gigabit fiber internet...\",\"icon\":\"Wifi\"},{\"id\":2,\"name\":\"Laundry Services\",\"description\":\"24/7 self-service laundry room equipped...\",\"icon\":\"WashingMachine\"},{\"id\":3,\"name\":\"24/7 Security\",\"description\":\"Advanced biometric access...\",\"icon\":\"ShieldCheck\"},{\"id\":4,\"name\":\"Modern Gym\",\"description\":\"Fully equipped fitness center...\",\"icon\":\"Dumbbell\"},{\"id\":1784710003148,\"name\":\"Cafe\",\"description\":\"Cafe\",\"icon\":\"Coffee\"}]",
      "maps_location_url": null,
      "contact_info": ""
    }
  ]
};

async function main() {
  console.log('Seeding database with exact local state...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.maintenanceRoom.deleteMany();
  await prisma.maintenanceSchedule.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.member.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.boardingHouseProfile.deleteMany();

  // Insert data (in order of dependencies)
  for (const user of data.users) {
    if (user.reset_token_expiry) user.reset_token_expiry = new Date(user.reset_token_expiry);
    await prisma.user.create({ data: user });
  }
  for (const room of data.rooms) {
    await prisma.room.create({ data: room });
  }
  for (const member of data.members) {
    if (member.due_date) member.due_date = new Date(member.due_date);
    await prisma.member.create({ data: member });
  }
  for (const complaint of data.complaints) {
    await prisma.complaint.create({ data: complaint });
  }
  for (const payment of data.payments) {
    if (payment.payment_date) payment.payment_date = new Date(payment.payment_date);
    if (payment.due_date) payment.due_date = new Date(payment.due_date);
    await prisma.payment.create({ data: payment });
  }
  for (const schedule of data.maintenanceSchedules) {
    if (schedule.date) schedule.date = new Date(schedule.date);
    await prisma.maintenanceSchedule.create({ data: schedule });
  }
  for (const mr of data.maintenanceRooms) {
    await prisma.maintenanceRoom.create({ data: mr });
  }
  for (const ann of data.announcements) {
    if (ann.expiry_date) ann.expiry_date = new Date(ann.expiry_date);
    await prisma.announcement.create({ data: ann });
  }
  for (const profile of data.profiles) {
    await prisma.boardingHouseProfile.create({ data: profile });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
