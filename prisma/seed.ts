// SEED FILE – 2026 demo data for PapiKost
// Includes: 1 admin, 4 active tenants, rooms, payments (Jan–Jul 2026), complaints, announcements
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─── 1. BoardingHouseProfile ───────────────────────────────────────────────
  await prisma.boardingHouseProfile.create({
    data: {
      id: 1,
      name: 'PapiKost',
      description: 'Premium kost management system for modern living.',
      facilities: JSON.stringify([
        { id: 1, name: 'High-Speed Wi-Fi', description: 'Dedicated gigabit fiber internet for all residents.', icon: 'Wifi' },
        { id: 2, name: 'Laundry Services', description: '24/7 self-service laundry room.', icon: 'WashingMachine' },
        { id: 3, name: '24/7 Security', description: 'Advanced biometric access control.', icon: 'ShieldCheck' },
        { id: 4, name: 'Modern Gym', description: 'Fully equipped fitness center.', icon: 'Dumbbell' },
        { id: 5, name: 'Café', description: 'In-house café open from 7 AM to 10 PM.', icon: 'Coffee' },
      ]),
      maps_location_url: null,
      contact_info: '+62 21 1234 5678',
    },
  });

  // ─── 2. Users ─────────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('admin123', 10);
  const tenantPass = await bcrypt.hash('tenant123', 10);

  const admin = await prisma.user.create({
    data: {
      id: 1,
      email: 'papikost123@gmail.com',
      password: adminPass,
      role: 'admin',
    },
  });

  const u1 = await prisma.user.create({ data: { email: 'fathan@example.com', password: tenantPass, role: 'tenant' } });
  const u2 = await prisma.user.create({ data: { email: 'ayu@example.com', password: tenantPass, role: 'tenant' } });
  const u3 = await prisma.user.create({ data: { email: 'budi@example.com', password: tenantPass, role: 'tenant' } });
  const u4 = await prisma.user.create({ data: { email: 'sari@example.com', password: tenantPass, role: 'tenant' } });

  // ─── 3. Rooms ─────────────────────────────────────────────────────────────
  const r101 = await prisma.room.create({
    data: {
      room_number: '101', floor: 1, type: 'Deluxe', price: 1600000, status: 'Occupied',
      features: JSON.stringify(['Double Bed', 'En-suite Bathroom', 'Workspace', 'AC']),
      imageUrl: '/assets/rooms/room_101.png',
    },
  });
  const r102 = await prisma.room.create({
    data: {
      room_number: '102', floor: 1, type: 'Suite', price: 2000000, status: 'Occupied',
      features: JSON.stringify(['Queen Bed', 'Smart TV', 'Sofa', 'AC', 'Mini Kitchen']),
      imageUrl: '/assets/rooms/room_102.png',
    },
  });
  const r103 = await prisma.room.create({
    data: {
      room_number: '103', floor: 1, type: 'Standard', price: 1300000, status: 'Occupied',
      features: JSON.stringify(['Single Bed', 'AC', 'WiFi', 'Private Bathroom']),
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80',
    },
  });
  const r104 = await prisma.room.create({
    data: {
      room_number: '104', floor: 1, type: 'Deluxe', price: 1650000, status: 'Occupied',
      features: JSON.stringify(['Double Bed', 'AC', 'WiFi', 'Private Bathroom', 'Balcony']),
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80',
    },
  });
  await prisma.room.create({
    data: {
      room_number: '105', floor: 2, type: 'Standard', price: 1300000, status: 'Available',
      features: JSON.stringify(['Single Bed', 'AC', 'WiFi', 'Shared Bathroom']),
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80',
    },
  });
  await prisma.room.create({
    data: {
      room_number: '106', floor: 2, type: 'VIP', price: 5000000, status: 'Available',
      features: JSON.stringify(['King Bed', 'Smart TV', 'Jacuzzi', 'AC', 'Mini Kitchen', 'Balcony']),
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80',
    },
  });

  // ─── 4. Members ───────────────────────────────────────────────────────────
  // due_date = 2026-08-01 (next billing cycle starts August)
  const m1 = await prisma.member.create({
    data: {
      user_id: u1.id, room_id: r101.id,
      name: 'Fathan Raditya', phone: '+6287838079999',
      status: 'active', due_date: new Date('2026-08-01'),
      join_date: new Date('2026-01-01'), id_number: '3201234567890001',
    },
  });
  const m2 = await prisma.member.create({
    data: {
      user_id: u2.id, room_id: r102.id,
      name: 'Ayu Lestari', phone: '+6281234560001',
      status: 'active', due_date: new Date('2026-08-01'),
      join_date: new Date('2026-02-01'), id_number: '3201234567890002',
    },
  });
  const m3 = await prisma.member.create({
    data: {
      user_id: u3.id, room_id: r103.id,
      name: 'Budi Santoso', phone: '+6281234560002',
      status: 'active', due_date: new Date('2026-08-01'),
      join_date: new Date('2026-03-01'), id_number: '3201234567890003',
    },
  });
  const m4 = await prisma.member.create({
    data: {
      user_id: u4.id, room_id: r104.id,
      name: 'Sari Wulandari', phone: '+6281234560003',
      status: 'active', due_date: new Date('2026-08-01'),
      join_date: new Date('2026-04-01'), id_number: '3201234567890004',
    },
  });

  // ─── 5. Payments ──────────────────────────────────────────────────────────
  // Spread paid payments across Jan–Jul 2026 so the revenue chart has data
  // in all 7 months. Mix different members.
  const paidPayments = [
    // January 2026
    { member_id: m1.id, amount: r101.price, month: 'January 2026',  payDate: '2026-01-05', dueDate: '2026-01-05' },
    // February 2026
    { member_id: m1.id, amount: r101.price, month: 'February 2026', payDate: '2026-02-05', dueDate: '2026-02-05' },
    { member_id: m2.id, amount: r102.price, month: 'February 2026', payDate: '2026-02-07', dueDate: '2026-02-07' },
    // March 2026
    { member_id: m1.id, amount: r101.price, month: 'March 2026',    payDate: '2026-03-05', dueDate: '2026-03-05' },
    { member_id: m2.id, amount: r102.price, month: 'March 2026',    payDate: '2026-03-06', dueDate: '2026-03-06' },
    { member_id: m3.id, amount: r103.price, month: 'March 2026',    payDate: '2026-03-10', dueDate: '2026-03-10' },
    // April 2026
    { member_id: m1.id, amount: r101.price, month: 'April 2026',    payDate: '2026-04-05', dueDate: '2026-04-05' },
    { member_id: m2.id, amount: r102.price, month: 'April 2026',    payDate: '2026-04-04', dueDate: '2026-04-04' },
    { member_id: m3.id, amount: r103.price, month: 'April 2026',    payDate: '2026-04-08', dueDate: '2026-04-08' },
    { member_id: m4.id, amount: r104.price, month: 'April 2026',    payDate: '2026-04-07', dueDate: '2026-04-07' },
    // May 2026
    { member_id: m1.id, amount: r101.price, month: 'May 2026',      payDate: '2026-05-05', dueDate: '2026-05-05' },
    { member_id: m2.id, amount: r102.price, month: 'May 2026',      payDate: '2026-05-03', dueDate: '2026-05-03' },
    { member_id: m3.id, amount: r103.price, month: 'May 2026',      payDate: '2026-05-07', dueDate: '2026-05-07' },
    { member_id: m4.id, amount: r104.price, month: 'May 2026',      payDate: '2026-05-06', dueDate: '2026-05-06' },
    // June 2026
    { member_id: m1.id, amount: r101.price, month: 'June 2026',     payDate: '2026-06-05', dueDate: '2026-06-05' },
    { member_id: m2.id, amount: r102.price, month: 'June 2026',     payDate: '2026-06-04', dueDate: '2026-06-04' },
    { member_id: m3.id, amount: r103.price, month: 'June 2026',     payDate: '2026-06-06', dueDate: '2026-06-06' },
    { member_id: m4.id, amount: r104.price, month: 'June 2026',     payDate: '2026-06-05', dueDate: '2026-06-05' },
    // July 2026 – already paid
    { member_id: m1.id, amount: r101.price, month: 'July 2026',     payDate: '2026-07-05', dueDate: '2026-07-05' },
    { member_id: m2.id, amount: r102.price, month: 'July 2026',     payDate: '2026-07-04', dueDate: '2026-07-04' },
  ];

  for (const p of paidPayments) {
    await prisma.payment.create({
      data: {
        member_id: p.member_id,
        amount: p.amount,
        payment_method: 'bank_transfer',
        status: 'paid',
        payment_date: new Date(p.payDate),
        due_date: new Date(p.dueDate),
        billing_month: p.month,
        gateway_reference: null,
      } as any,
    });
  }

  // Pending invoices for July 2026 (members 3 & 4 haven't paid yet)
  await prisma.payment.create({
    data: {
      member_id: m3.id,
      amount: r103.price,
      payment_method: 'midtrans',
      status: 'pending',
      payment_date: new Date('2026-07-27'),
      due_date: new Date('2026-08-01'),
      billing_month: 'July 2026',
      gateway_reference: null,
    } as any,
  });
  await prisma.payment.create({
    data: {
      member_id: m4.id,
      amount: r104.price,
      payment_method: 'midtrans',
      status: 'pending',
      payment_date: new Date('2026-07-27'),
      due_date: new Date('2026-08-01'),
      billing_month: 'July 2026',
      gateway_reference: null,
    } as any,
  });

  // ─── 6. Complaints ────────────────────────────────────────────────────────
  await prisma.complaint.create({
    data: {
      member_id: m3.id,
      category: 'Plumbing',
      description: 'Kran air di kamar mandi menetes terus dan tidak bisa ditutup rapat.',
      status: 'pending',
      tracking_id: 'REQ-20260001',
    },
  });
  await prisma.complaint.create({
    data: {
      member_id: m1.id,
      category: 'Electrical',
      description: 'Saklar lampu kamar tidak berfungsi dengan baik, lampu berkedip-kedip.',
      status: 'in_progress',
      tracking_id: 'REQ-20260002',
    },
  });

  // ─── 7. Announcements ─────────────────────────────────────────────────────
  await prisma.announcement.create({
    data: {
      title: 'Jadwal Pemadaman Listrik',
      body: 'PLN akan melakukan pemadaman listrik pada hari Sabtu, 2 Agustus 2026 pukul 08.00–14.00. Mohon persiapkan power bank dan penerangan cadangan.',
      expiry_date: new Date('2026-08-03'),
    },
  });
  await prisma.announcement.create({
    data: {
      title: 'Pembersihan Kolam & Gym — Agustus',
      body: 'Jadwal rutin kebersihan fasilitas bersama (gym dan area parkir) akan dilakukan setiap Minggu pertama bulan Agustus. Mohon tidak meninggalkan barang pribadi di area umum.',
      expiry_date: new Date('2026-08-10'),
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('   Admin email: papikost123@gmail.com  (password: admin123)');
  console.log('   Tenants: fathan@, ayu@, budi@, sari@ @example.com (password: tenant123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });