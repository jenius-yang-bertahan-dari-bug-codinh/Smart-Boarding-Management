import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear existing rooms
  await prisma.room.deleteMany()

  const rooms = [
    {
      room_number: '101',
      floor: 1,
      type: 'Deluxe',
      price: 250,
      status: 'Available',
      features: JSON.stringify(['Double Bed', 'En-suite', 'Workspace']),
      imageUrl: '/assets/rooms/room_101.png',
    },
    {
      room_number: '102',
      floor: 1,
      type: 'Suite',
      price: 350,
      status: 'Full',
      features: JSON.stringify(['Queen Bed', 'Smart TV', 'Sofa']),
      imageUrl: '/assets/rooms/room_102.png',
    },
    {
      room_number: '205',
      floor: 2,
      type: 'Standard',
      price: 160,
      status: 'Available',
      features: JSON.stringify(['Single Bed', 'Workspace']),
      imageUrl: '/assets/rooms/room_205.png',
    }
  ]

  for (const room of rooms) {
    await prisma.room.create({
      data: room
    })
  }
  console.log('Database seeded with rooms.')

  // Hash the password
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 1. Create or update the User "Alex"
  const alexUser = await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'alex@example.com',
      password: hashedPassword,
      role: 'guest',
    },
  })

  // 2. Create or update the Member profile for Alex
  const room101 = await prisma.room.findUnique({ where: { room_number: '101' } })
  
  if (room101) {
    const existingMember = await prisma.member.findFirst({
      where: { user_id: alexUser.id },
    })

    if (!existingMember) {
      await prisma.member.create({
        data: {
          user_id: alexUser.id,
          room_id: room101.id,
          name: 'Alex Johnson',
          phone: '123-456-7890',
          status: 'active',
        },
      })
    }
  }

  console.log('Database seeded with user Alex (alex@example.com / password123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
